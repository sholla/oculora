/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.MappingIterator;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;

import com.opentok.OpenTok;
import com.opentok.exception.OpenTokException;

public class RevideoService implements IRevideoHandler{

    private static final String apiKey = System.getProperty("API_KEY");
    private static final String apiSecret = System.getProperty("API_SECRET");
    //private static OpenTok opentok;

    ObjectMapper mapper = new ObjectMapper();
    @Autowired
    ServiceImpl impl;

	@Override
	public String handleMessage(String inMsg) {
		// TODO Auto-generated method stub
		Map<String, Object> res = null;
		try {
			//ServiceImpl impl = new ServiceImpl();
			res = mapper.readValue(inMsg, Map.class);
			Object apiMethodO = res.get(ApiFields.ApiMethod);
			if(!( apiMethodO instanceof Integer)) {
				return inMsg;
			}
			int apiMethod = (Integer) apiMethodO;
			if((apiMethod < 0) || (apiMethod > (ApiMethodsEnum.values().length-1)))
				return null;
			ApiMethodsEnum enumApiMethod = ApiMethodsEnum.values()[apiMethod];
			switch(enumApiMethod)
			{
			case Api_Login:
			{
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String ret = impl.login(adid, data);
				return ret;
				
				/*String adid = (String) res.get(ApiFields.AppDeviceID);
				String ret = impl.login(adid);
				return ret;*/
			}
			
			case Api_UserInfo:
			{
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String ret = impl.userprofile(adid, data);
				return ret;
			}
			
			case Api_RemoveUser:
			{
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				
				String ret = impl.removeuser(adid, data);
				return ret;
			}
			
			case Api_GetUser:
			{
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				
				String ret = impl.getUser(adid, data, false);
				return ret;
			}
			
			case Api_OpenRoom:
			{
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				
				String ret = impl.openroom(adid, data);
				return ret;
			}
			
			case Api_RemoveRoom:
			{
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				
				String ret = impl.removeroom(adid, data);
				return ret;
			}
			
			case Api_FollowModel:
			{
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				
				String ret = impl.followmodel(adid, data);
				return ret;
			}
			case Api_ListRoom:
			{
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				
				String ret = impl.listroom(adid, data);
				return ret;
			}
			
			case Api_PubCandidates:
			{
				
				
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				String ret = impl.pubCandidates(adid, data);
				return ret;
			}
			
			case Api_ActiveSubCandidates:
			{
				
				
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				String ret = impl.activeSubCandidates(adid, data);
				return ret;
			}
			case Api_StartSession:
			{
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				
				String ret = impl.startSession(adid, data);
				return ret;
			}
			case Api_SubscribeSession:
			{
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				
				String ret = impl.subscribeSession(adid, data);
				return ret;
			}
			case Api_EndSession:
			{
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				
				String ret = impl.endSession(adid, data);
				return ret;
			}
			case Api_Credits:
			{
				String adid = (String) res.get(ApiFields.AppDeviceID);
				String data = null;
				Object dataO = res.get(ApiFields.DataJSON);
				if(dataO instanceof List) {
					List<String> lst = (List<String>) dataO;
					data = lst.get(0);
				}
				else if(dataO instanceof String) {
					data = (String) dataO;
				}
				
				String ret = impl.credits(adid, data);
				return ret;
			}
			default:
				break;
			}
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
		catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
		return inMsg;
	}
}
