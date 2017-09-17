/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import com.opentok.OpenTok;
import com.opentok.Role;
import com.opentok.Session;
import com.opentok.TokenOptions;
import com.opentok.exception.OpenTokException;
import com.tamatura.revideo.data.model.Room;

/**
 * @author Shreesh
 *
 * Utilities to handles Webrtc/Opentok features
 */
public class WebrtcService {

	private static final Logger LOG = LoggerFactory.getLogger(WebrtcService.class);
	private static final boolean INOPENTOK = true;
	@Value("${opentok.auth.key}")
	private String apiKey;
	//public static final String apiKey = System.getProperty("API_KEY");
    //private static final String apiSecret = System.getProperty("API_SECRET");
	@Autowired
    private OpenTok opentok;
    
    /*static {
		if (apiKey == null || apiKey.isEmpty() || apiSecret == null || apiSecret.isEmpty()) {
	        System.out.println("You must define API_KEY and API_SECRET system properties in the build.gradle file.");
	        System.exit(-1);
	    }
		opentok = new OpenTok(Integer.parseInt(apiKey), apiSecret);
    }
	*/
    public WebrtcService() {
    	
    }

    public final String getApiKey()
    {
    	return apiKey;
    }
    
    public String createSession()
    {
    	if(INOPENTOK != false) {
    		try {
    			Session sess = opentok.createSession();
    			return sess.getSessionId();
    		} catch (OpenTokException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    			return null;
    		}
    	}
    	else
    		return "1234";
    	
    	
    }
    
	public String createToken(String sessId, Room.StreamType streamType, String data) throws OpenTokException {

		String token = null;
		if(INOPENTOK != false) {
			TokenOptions.Builder s = new TokenOptions.Builder();
			if(data != null) s.data(data);
			Role curRole = null;
			switch(streamType) {
			case StreamType_Publish:
				curRole = Role.PUBLISHER;
				break;
			case StreamType_Subscribe:
				curRole = Role.SUBSCRIBER;
				break;
			}
			if(curRole == null)
				return null;
			s.role(curRole);
			s.expireTime(0);
		    
		    try {
		        token = opentok.generateToken(sessId, s.build());
		    } catch (OpenTokException e) {
		        e.printStackTrace();
		    }
		}
		else 
			token = "7654";
	
	    return token;
	}
	
	
}
