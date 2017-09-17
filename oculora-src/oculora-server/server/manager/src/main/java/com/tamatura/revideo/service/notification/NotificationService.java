/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.notification;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import com.google.android.gcm.server.Message;
import com.tamatura.revideo.data.model.Room;
import com.tamatura.revideo.data.model.User;
import com.tamatura.revideo.data.model.Room.StreamType;
import com.tamatura.revideo.service.messaging.MessagingManager;
import com.tamatura.revideo.service.notification.gcm.GCMNotifyPlatform;

/**
 * @author Shreesh
 *
 */
public class NotificationService {
	private static final int Notifier_Select_PAGE_SIZE = 1000;
	//@Autowired
    //private MessagingManager mMsgMgr;
	@Autowired
	@Qualifier("taskExecutorNotify")
	private TaskExecutor taskExecutorNotify;
	
	ObjectMapper mapper = new ObjectMapper();
    
    @Autowired
    @Qualifier("mongoTemplateP2P")
	MongoOperations mongoOperationsP2P;
    
    @Autowired
    @Qualifier("mongoTemplateUSER")
	MongoOperations mongoOperationsUSER;
    
    @Autowired
    private GCMNotifyPlatform gcmImpl;
	private class NotificationTask implements Runnable {

        private NotificationArgs arg;
        private String message;
        
        public NotificationTask(NotificationArgs arg, String msg) {
            this.arg = arg;
            this.message = msg;
        }

        public void run() {
        	Query q = query(where("id").is(arg.roomId));
        	if(arg.stType == Room.StreamType.StreamType_Publish) {
				//mongoOperationsP2P.updateFirst(q, new Update().addToSet("refPubs", arg.userId), Room.class);
				//String[] subArrayFields = {"refRoomsFW", "refRoomsKWs", "refRoomsOneWay", "refUsersFW", "refUsersKWs", "refUsersOneWay"};
        		q = query(where("id").is(arg.roomId));
        		q.fields().include("refSubs");
        		Room room1 = mongoOperationsP2P.findOne(q, Room.class);
        		Set<String> refSubs = new HashSet<String>();
        		if(room1.refSubs != null)
        			refSubs.addAll(room1.refSubs);
        		String[] subArrayFields = {"refRoomsFW", "refRoomsKWs", "refUsersFW", "refUsersKWs"};
				//now notify everyone who should be invited to the session
				for(int i = 0; i < subArrayFields.length; i++) {
					String field = subArrayFields[i];
					boolean empty = false;
					int page = 0;
					while(true) {
						Set<String> regidsList = new HashSet<String>();
						q = query(where("id").is(arg.roomId));
						q.fields().slice(field, page*Notifier_Select_PAGE_SIZE, Notifier_Select_PAGE_SIZE);
						Room room = mongoOperationsP2P.findOne(q, Room.class);
						Set<String> selSet = null ;
						switch(i) {
						case 0:
							selSet = room.refRoomsFW;
							break;
						case 1:
							selSet = room.refRoomsKWs;
							break;
						/*case 2:
							selSet = room.refRoomsOneWay;
							break;*/
						case 2:
							selSet = room.refUsersFW;
							break;
						case 3:
							selSet = room.refUsersKWs;
							break;
						/*case 5:
							selSet = room.refUsersOneWay;
							break;*/
						}
						
						if((selSet == null) || (selSet.isEmpty() != false)) {
							empty = true;
							break;
						}
						selSet.remove(arg.userId);
						selSet.removeAll(refSubs);
						q = query(where("id").in(selSet));
						q.fields().include("id").include("notifyRegId");
						List<User> users = mongoOperationsUSER.find(q, User.class);
						for(User u: users) {
							regidsList.add(u.notifyRegId);
							//notificationImpl.sendNotification(msg);
						}
						if(regidsList.isEmpty() != true)
							gcmImpl.sendNotification(regidsList, message);
						page++;
					}
				}
				
				
			}
			else if(arg.stType == Room.StreamType.StreamType_Subscribe) {
				//mongoOperationsP2P.updateFirst(q, new Update().addToSet("refSubs", arg.userId), Room.class);
			}
        	
        }

    }
	
	public static class NotificationArgs {
		public String userId;
		public String roomId;
		//public String roomOwnerId;
		public StreamType stType;
	}
	
	
	public boolean sendNotification(NotificationArgs arg, String msg) {
		taskExecutorNotify.execute(new NotificationTask(arg, msg));
		
		return true;
	}
	
	
}
