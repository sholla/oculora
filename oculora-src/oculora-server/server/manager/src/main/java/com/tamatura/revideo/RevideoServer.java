/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.tamatura.revideo.service.messaging.MessagingManager;

public class RevideoServer {

	//@Autowired
    //MessagingManager mMessagingMgr;
    
	private final static String[] mConfigFiles = {
		"/META-INF/spring/jms-context.xml",
		"/META-INF/spring/mongo-context.xml",
		"/META-INF/spring/app-context.xml",
		
	};
    public static void main(String[] args) {

    	

    	ApplicationContext context = new ClassPathXmlApplicationContext(mConfigFiles, RevideoServer.class);

        
    }
}
