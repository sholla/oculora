/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.messaging;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.TextMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.stereotype.Component;

import com.tamatura.revideo.service.IRevideoHandler;
/**
 * This class drives the example from the consumer side. It loads the Spring 
 * {@link ApplicationContext} and sends messages. The entire configuration for 
 * this app is held in <tt>src/main/resources/jms-context.xml</tt>. 
 * 
 * @author bsnyder
 *
 */
//@Component
public class MessagingManager {
	
	private static final Logger LOG = LoggerFactory.getLogger(MessagingManager.class);
    
	@Autowired
    private IRevideoHandler mHandler;
	
	//@Autowired
	//private static SimpleMessageReceiver mReceiver;
	@Autowired
	private SimpleMessageProducer mProducer;
	static {
		//mContext = new ClassPathXmlApplicationContext("/META-INF/spring/jms-context.xml", MessagingManager.class);
    	//mReceiver = mContext.getBean(SimpleMessageReceiver.class);
    	//mProducer = (SimpleMessageProducer) mContext.getBean("messageProducer");
        //
	}
    /**
     * Run the consume and tell the producer to send its messages. 
     * 
     * @param args
     * @throws JMSException
     */
	
   public void receiveMessage(TextMessage msg) throws JMSException {
    	
	   String resp = mHandler.handleMessage(msg.getText());
	   //msg.setText(resp);
	   sendMessage(msg, resp);
    }
    
    /**
     * Send messages. 
     * 
     * @param args
     * @throws JMSException
     */
    public void sendMessage(TextMessage msg, String txt) throws JMSException {
    	
        mProducer.sendMessage(msg, txt);
    }
    
    public void sendNotification(final String msg)
	{
    	mProducer.sendNotification(msg);
	}
    
}
