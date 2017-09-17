/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.messaging;

import java.util.Date;

import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;
import javax.jms.TextMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;

public class SimpleMessageProducer {
    
    private static final Logger LOG = LoggerFactory.getLogger(SimpleMessageProducer.class);
    private static final String MSGID = "revideosel"; //property to use for selector
    
    @Autowired
    @Qualifier("jmsTemplateProducer")
    protected JmsTemplate jmsTemplate; 
    
    /*@Autowired
    @Qualifier("destinationProducer")
    Destination produceDest;*/
    
    @Autowired
    @Qualifier("jmsTemplateNotifyProducer")
    protected JmsTemplate jmsNotifyTemplate; 
    
    /*@Autowired
    @Qualifier("destinationNotificationProducer")
    Destination produceNotifyDest;*/
    /*protected int numberOfMessages = 100; 
    
    public void setNumberOfMessages(int numberOfMessages) {
        this.numberOfMessages = numberOfMessages;
    }*/

    public JmsTemplate getJmsTemplate() {
		return jmsTemplate;
	}

	public void setJmsTemplate(JmsTemplate jmsTemplate) {
		this.jmsTemplate = jmsTemplate;
	}

	/*public void sendMessages(String sendType) throws JMSException {
		if ("jmsSend".equalsIgnoreCase(sendType)) {
			jmsSendMessages();
		} else if ("convertAndSend".equalsIgnoreCase(sendType)) {
			convertAndSendMessages();
		}
		else {
			
		}
	}
	
	public void convertAndSendMessages() throws JMSException {
        final StringBuilder buffer = new StringBuilder(); 
        
        for (int i = 0; i < numberOfMessages; ++i) {
            buffer.append("Message '").append(i).append("' sent at: ").append(new Date());
            jmsTemplate.convertAndSend(buffer.toString());
        }
    }*/
	
	public void sendMessage(final TextMessage msg, final String txt)
	{
		//jmsTemplate.convertAndSend(msg);
		jmsTemplate.send(new MessageCreator() {

			@Override
			public Message createMessage(Session session) throws JMSException {
				// TODO Auto-generated method stub
				TextMessage message = session.createTextMessage(txt); 
				//String prop = msg.getStringProperty(MSGID);
				message.setStringProperty(MSGID, msg.getStringProperty(MSGID));
				return message;
			}
			
		});
	}
	
	public void sendNotification(final String msg)
	{
		jmsTemplate.send(new MessageCreator() {
            public Message createMessage(Session session) throws JMSException {
                TextMessage message = session.createTextMessage(msg); 
                
                return message;
            }
        });
	}
	
	/*public void sendMessage(final String msg)
	{
		jmsTemplate.send(new MessageCreator() {
            public Message createMessage(Session session) throws JMSException {
                TextMessage message = session.createTextMessage(msg); 
                
                return message;
            }
        });
	}*/
	
	/*public void jmsSendMessages() throws JMSException {
        final StringBuilder buffer = new StringBuilder(); 
        
		for (int i = 0; i < numberOfMessages; ++i) {
            buffer.append("Message '").append(i).append("' sent at: ").append(new Date());
            
            final int count = i;
            final String payload = buffer.toString();
            
            jmsTemplate.send(new MessageCreator() {
                public Message createMessage(Session session) throws JMSException {
                    TextMessage message = session.createTextMessage(payload); 
                    message.setIntProperty("messageCount", count);
                    LOG.info("Sending message number '{}'", count);
                    return message;
                }
            });
        }
	}*/
	
}
