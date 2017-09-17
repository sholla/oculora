/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.messaging;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageListener;
import javax.jms.TextMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jms.core.JmsTemplate;

import com.tamatura.revideo.service.IRevideoHandler;

public class SimpleMessageReceiver implements MessageListener {
    
    private static final Logger LOG = LoggerFactory.getLogger(SimpleMessageReceiver.class);
    //private static final String MSGID = "revideosel"; //property to use for selector
    
    @Autowired
    private MessagingManager mMsgMgr;
    /*@Autowired
    @Qualifier("jmsTemplateConsumer")
    protected JmsTemplate jmsTemplate; 
    
    
    public JmsTemplate getJmsTemplateReceiver() {
		return jmsTemplate;
	}

	public void setJmsTemplateReceiver(JmsTemplate jmsTemplate) {
		this.jmsTemplate = jmsTemplate;
	}*/
/*
	public void receive(String receiveType) {
		if ("jmsReceive".equalsIgnoreCase(receiveType)) {
			jmsReceive();
		} else if ("receiveAndConvert".equalsIgnoreCase(receiveType)) {
			receiveAndConvert();
		}
	}
	
	public void jmsReceive() {
		Message message = jmsTemplate.receive();
		LOG.debug("Received a JMS message: {}", message);
    }
	
	public void receiveAndConvert() {
		String message = (String) jmsTemplate.receiveAndConvert();
		LOG.debug("Received a text message: {}", message);
	}*/

	@Override
	public void onMessage(Message message) {
		// TODO Auto-generated method stub
		try {
		       TextMessage msg = (TextMessage) message;
		       LOG.info("Consumed message: " + msg.getText());
		       //String prop = message.getStringProperty(MSGID);
		       //msg.setStringProperty(MSGID, message.getStringProperty(MSGID));
		       mMsgMgr.receiveMessage(msg);
		      } catch (JMSException e) {
		          // TODO Auto-generated catch block
		          e.printStackTrace();
		      }
	}

}
