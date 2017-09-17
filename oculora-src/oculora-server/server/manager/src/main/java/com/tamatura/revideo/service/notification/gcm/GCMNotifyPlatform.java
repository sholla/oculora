/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.notification.gcm;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.logging.Level;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import com.google.android.gcm.server.Constants;
import com.google.android.gcm.server.Message;
import com.google.android.gcm.server.MulticastResult;
import com.google.android.gcm.server.Result;
import com.google.android.gcm.server.Sender;
import com.tamatura.revideo.data.model.Room;
import com.tamatura.revideo.data.model.User;
import com.tamatura.revideo.service.notification.INotifyPlatform;

/**
 * @author Shreesh
 *
 */
public class GCMNotifyPlatform implements INotifyPlatform {
	//private static final String GcmAuthKey;
	
	private static final Logger logger = LoggerFactory.getLogger(GCMNotifyPlatform.class);
	private static final int MAX_RETRIES = 10;
	private static final int MULTICAST_SIZE = 1000;
	
	private static final String MSG_KEY = "message";
	private static final String DATA_KEY = "msg";
	
	@Autowired
	private Sender sender;
	
	@Autowired
	@Qualifier("taskExecutorNotifyPlatformGCM")
	private TaskExecutor taskExecutorNotify;
	
	@Autowired
    @Qualifier("mongoTemplateUSER")
	MongoOperations mongoOperationsUSER;
	//private static final Executor threadPool = Executors.newFixedThreadPool(5);
	
	@Override
	public void sendNotification(Set<String> regIds, String msg) {
		
		//Message m = new Message.Builder().build();
		// send a multicast message using JSON
        // must split in chunks of 1000 devices (GCM limit)
        int total = regIds.size();
        List<String> partialDevices = new ArrayList<String>(total);
        int counter = 0;
        int tasks = 0;
        for (String device : regIds) {
        	counter++;
        	partialDevices.add(device);
        	int partialSize = partialDevices.size();
        	if (partialSize == MULTICAST_SIZE || counter == total) {
        		//asyncSend(partialDevices, msg);
        		taskExecutorNotify.execute(new NotificationTask(partialDevices, msg));
        		partialDevices.clear();
        		tasks++;
        	}
        }
        logger.info( "Asynchronously sending " + tasks + " multicast messages to " +
                total + " devices");
	}
	
	private class NotificationTask implements Runnable {

		private List<String> regids;
		private String msg;
		
		public NotificationTask(List<String> regids, String msg) {
			this.regids = new ArrayList<String>();
			for(String ri: regids) {
				if(ri != null)
					this.regids.add(new String(ri));
			}
				
			this.msg = msg;
		}
		
		@Override
		public void run() {
			// TODO Auto-generated method stub
			if(regids.isEmpty() != false)
				return;
			Message message = new Message.Builder().addData(MSG_KEY, "Oculora - Publisher").addData(DATA_KEY, msg).build();
	        MulticastResult multicastResult;
	        try {
	        	multicastResult = sender.send(message, regids, MAX_RETRIES);
	        } catch (IOException e) {
	        	logger.error("Error posting messages", e);
	        	return;
	        }
	        List<Result> results = multicastResult.getResults();
	        // analyze the results
	        for (int i = 0; i < regids.size(); i++) {
	        	String regId = regids.get(i);
	        	Result result = results.get(i);
	        	String messageId = result.getMessageId();
	        	if (messageId != null) {
	            	logger.info("Succesfully sent message to device: " + regId +
	            			"; messageId = " + messageId);
	            	String canonicalRegId = result.getCanonicalRegistrationId();
	            	if (canonicalRegId != null) {
	            		// same device has more than on registration id: update it
	            		logger.info("canonicalRegId " + canonicalRegId);
	            		updateCanonical(regId, canonicalRegId);
	            	}
	        	} else {
	        		String error = result.getErrorCodeName();
	        		if (error.equals(Constants.ERROR_NOT_REGISTERED)) {
	        			// application has been removed from device - unregister it
	        			logger.info("Unregistered device: " + regId);
	        			removeRegistration(regId);
	        		} else {
	        			logger.error("Error sending message to " + regId + ": " + error);
	        		}
	        	}
	        }
		}
		
		private void updateCanonical(String regid, String canonicalId) {
			Query q = query(where("notifyRegId").is(regid));
			mongoOperationsUSER.updateFirst(q, new Update().set("notifyRegId", canonicalId), User.class);
		}
		
		private void removeRegistration(String regid) {
			//TODO: need to remove refs to this user and this users rooms
			/*Query q = query(where("notifyRegId").is(regid));
			User usero = mongoOperationsUSER.findOne(q, User.class);
			q.fields().include("id");
			mongoOperationsUSER.remove(q, User.class);*/
			
			//mongoOperationsUSER.updateFirst(q, new Update().set("notifyRegId", canonicalId), User.class);
		}
		
	}
	
}
