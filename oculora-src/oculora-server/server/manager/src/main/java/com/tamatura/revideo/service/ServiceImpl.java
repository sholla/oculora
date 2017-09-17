/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Random;
import java.util.Set;
import java.util.regex.Pattern;

import org.bson.BSON;
import org.bson.Transformer;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.domain.Sort.Order;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import static org.springframework.data.mongodb.core.query.Query.query;
import static org.springframework.data.mongodb.core.query.Criteria.where;

import com.mongodb.WriteResult;
import com.opentok.OpenTok;
import com.opentok.Role;
import com.opentok.TokenOptions;
import com.opentok.TokenOptions.Builder;
import com.opentok.exception.OpenTokException;
import com.tamatura.revideo.data.model.FollowType;
import com.tamatura.revideo.data.model.Follows;
import com.tamatura.revideo.data.model.House;
import com.tamatura.revideo.data.model.P2PEnumTypes;
import com.tamatura.revideo.data.model.P2PToken;
import com.tamatura.revideo.data.model.Purchase;
import com.tamatura.revideo.data.model.Room;
import com.tamatura.revideo.data.model.CreditsPush;
import com.tamatura.revideo.data.model.Room.ExtRoom;
import com.tamatura.revideo.data.model.RoomJsonDS;
import com.tamatura.revideo.data.model.SessionInstance;
import com.tamatura.revideo.data.model.SubInfo;
import com.tamatura.revideo.data.model.SubscribeData;
import com.tamatura.revideo.data.model.TokenGen;
import com.tamatura.revideo.data.model.User;
import com.tamatura.revideo.service.match.EMatchType;
import com.tamatura.revideo.service.match.MatchTarget;
import com.tamatura.revideo.service.match.MatchTargetType;
import com.tamatura.revideo.service.match.MatcherService;
import com.tamatura.revideo.service.notification.NotificationService;
import com.tamatura.revideo.service.notification.NotifyMessage;
import com.tamatura.revideo.service.sort.SortBy;
import com.tamatura.revideo.service.sort.SortOrder;
import com.tamatura.revideo.service.sort.SortSearchMode;

/**
 * @author Shreesh
 *
 */


public class ServiceImpl {
	
	private static final Logger LOG = LoggerFactory.getLogger(ServiceImpl.class);
	
    private static final String ADMIN_SESS_ID = "abcdef";
    
    private static final String[] loginTokAppend = {"r4uf34n35839", "cjn3f1438j8"};
    private static final String resultKeys[] = {"result", "message"};
    private static final String resultKeysAuth[] = {"pub", "sub"};
    
    private static final String BROADCAST_TO_PUBLISHERS = "ANY";
    
    private static final String TYPEOFACCESS_PUB = "P";
    private static final String TYPEOFACCESS_SUB = "S";
    
    private static final String CREDITSUB_PUB = "pub";
    private static final String CREDITSUB_CREDIT = "credit";
    
    private static final double TOKEN_EXPIRE_SLOT = 1*60*60*1000;
    private static final int LISTING_LIMIT = 10;
    
    
    
    
    ObjectMapper mapper = new ObjectMapper();
    
    @Autowired
    @Qualifier("mongoTemplateP2P")
	MongoOperations mongoOperationsP2P;
    
    @Autowired
    @Qualifier("mongoTemplateBUY")
	MongoOperations mongoOperationsBUY;
    
    @Autowired
    @Qualifier("mongoTemplateUSER")
	MongoOperations mongoOperationsUSER;
    
    Random logintokGenerator = new Random();
    
    @Autowired
    WebrtcService webRtcInst = new WebrtcService();
    
    @Autowired
    private NotificationService notificationImpl;
	
    @Autowired
    private MatcherService matcherImpl;
    
	private String getResult(List<Map<String, Object>> res)
	{
		String tok = null;
		try {
			tok = mapper.writeValueAsString(res);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return tok;
	}
	
	private String getResult(Map<String, Object> res)
	{
		String tok = null;
		try {
			tok = mapper.writeValueAsString(res);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return tok;
	}
	
	private String getLoginTok()
	{
		//FIXME: Do something actually secure!
		byte[] rand = new byte[20];
		logintokGenerator.nextBytes(rand);
		String tok = loginTokAppend[0] + (new String(rand)) + loginTokAppend[1];
		return tok;
	}
	
	private List<ExtRoom> getExtRooms(List<Room> rooms, String userid) {
		List<ExtRoom> retRooms = new ArrayList<ExtRoom>();
		//Set<String> srchSet = new HashSet<String>();
		Map<String, ExtRoom> extMap = new HashMap<String, ExtRoom>();
		for(Room rm : rooms) {
			ExtRoom rm1 = rm.getExtRoom();
			if(userid != null) {
				Query q = query(where("id").is(rm.userId));
				q.fields().include("nickName");
				User usero = mongoOperationsUSER.findOne(q, User.class);
				rm1.nickName = usero.nickName;
				//q = query(where("id").is(rm.id).andOperator(where("refRoomsFW").is(userid).orOperator(where("refUsersFW").is(userid))));
				/*q = query(where("id").is(rm.id));
				q.fields().include("refRoomsFW").include("refUsersFW");
				Room rm2 = mongoOperationsP2P.findOne(q, Room.class);
				if(rm2.refRoomsFW != null) {
					boolean exists = rm2.refRoomsFW.contains(userid);
					rm1.follow = exists;
				}
				else
					rm1.follow = false;*/
				
				//srchSet.add(rm.id);
				extMap.put(rm.id, rm1);
				//rm1.follow = mongoOperationsP2P.exists(q, Room.class);
			}
			
			retRooms.add(rm1);
		}
		if(userid != null) {
			Query q = query(where("id").in(extMap.keySet()).andOperator(where("refRoomsFW").is(userid).orOperator(where("refUsersFW").is(userid))));
			q.fields().include("id");
			List<Room> rms = mongoOperationsP2P.find(q, Room.class);
			for(Room rm: rms) {
				ExtRoom rm1 = extMap.get(rm.id);
				rm1.follow = true;
			}
			
		}
		return retRooms;
	}
	
	private List<ExtRoom> getExtRooms2(List<MatchTarget> rooms) {
		List<ExtRoom> retRooms = new ArrayList<ExtRoom>();
		for(MatchTarget rm : rooms) {
			Room rm2 = (Room) rm.target;
			ExtRoom rm1 = rm2.getExtRoom();
			Query q = query(where("id").is(rm2.userId));
			q.fields().include("nickName");
			User usero = mongoOperationsUSER.findOne(q, User.class);
			rm1.nickName = usero.nickName;
			retRooms.add(rm1);
		}
		return retRooms;
	}
	
	public String createaccount(String data)
	{
		return null;
	}
	
	public String changeaccount(String data)
	{
		return null;
	}
	
	public String forgotpw(String data)
	{
		return null;
	}
	
	public String forgotusername(String data)
	{
		return null;
	}
	
	class EnumTransformer implements Transformer {
        public Object transform(Object o) {
            return o.toString();  // convert any object (including an Enum) to its String representation
        }
    }
	
	public ServiceImpl() {
		BSON.addEncodingHook(Enum.class, new EnumTransformer());
	}
	
	public void initService() {
		//ensure Spring actually creats indexes from the class annotations
		//FIXME: Unless the following is done, the fields are not indexed!
		mongoOperationsUSER.indexOps(User.class).ensureIndex(new Index().on("nickName",Direction.ASC).unique());;
		mongoOperationsP2P.indexOps(Room.class).ensureIndex(new Index().on("name",Direction.ASC).unique());;
	}
	public String login(String adid, String data) throws AssertionError
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], ServiceResults.ServiceResults_ERROR.ordinal());
		res.put(resultKeys[1], "Invalid");
		
		Map<String, Object> vals = null;
		String notifyRegId = null;
			
		try {
			vals = mapper.readValue(data, Map.class);
			notifyRegId = (String) vals.get(ApiFields.NotifyRegId);
			
			assert adid != null : "no adid";
		} catch (AssertionError e) {
			res.put(resultKeys[1], e.getMessage());
			return getResult(res);
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			res.put(resultKeys[1], e.getMessage());
			return getResult(res);
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			res.put(resultKeys[1], e.getMessage());
			return getResult(res);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			res.put(resultKeys[1], e.getMessage());
			return getResult(res);
		}
		boolean newUser = false;
		Query q = query(where("adid").is(adid));
		q.fields().include("id");
		User usero = mongoOperationsUSER.findOne(q, User.class);
		if(usero == null)
		{
			LOG.info("No such user: " + adid);
			res.put(resultKeys[1], "No such user: " + adid);
			return getResult(res);
			/*usero = new User();
			usero.loginToken = getLoginTok();
			usero.adid = adid;
			mongoOperationsUSER.save(usero);
			newUser = true;*/
			
		}
		else {
			if(notifyRegId == null) {
				LOG.info("No Notify Credentials: " + adid);
				res.put(resultKeys[1], "No Notify Credentials: " + adid);
				return getResult(res);
			}
			usero.loginToken = getLoginTok();
			mongoOperationsUSER.updateFirst(query(where("adid").is(adid)), new Update().set("loginToken", usero.loginToken).set("notifyRegId", notifyRegId), User.class);
			
			
		}
		res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
		Map<String, String> res1 = new HashMap<String, String>();
		res1.put(ApiFields.LoginToken, usero.loginToken);
		//if(newUser != false) {
			//TODO: encrypt the following actually with logintoken
			res1.put(ApiFields.OT_API_KEY, webRtcInst.getApiKey());
			//res1.put(ApiFields.ADMIN_SESS_ID, ADMIN_SESS_ID);
		//}
		
		try {
			res.put(resultKeys[1], mapper.writeValueAsString(res1));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], e.getMessage());
			return getResult(res);
		}
		return getResult(res);
	}
	
	public String userprofile(String adid, String data) throws AssertionError
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], ServiceResults.ServiceResults_ERROR);
		res.put(resultKeys[1], "Invalid");
		Map<String, Object> vals = null;
		try {
			vals = mapper.readValue(data, Map.class);
			//String user = (String) vals.get(ApiFields.User);
			//String notifyRegId = (String) vals.get(ApiFields.NotifyRegId);
			String name = (String) vals.get(ApiFields.User);
			String nickname = (String) vals.get(ApiFields.NickName);
			String imageName = (String) vals.get(ApiFields.ProfileImage);
			List<String> kws = (List<String>) vals.get(ApiFields.Keywords);
			
			Query q = query(where("adid").is(adid));
			q.fields().include("id");
			User usero = mongoOperationsUSER.findOne(q, User.class);
			if(usero == null)
			{
				LOG.info("No such user: " + adid);
				/*if(notifyRegId == null) {
					LOG.info("No Notify Credentials: " + adid);
					res.put(resultKeys[1], "No Notify Credentials: " + adid);
				return getResult(res);
				}*/
				q = query(where("nickName").is(nickname));
				boolean exists = mongoOperationsUSER.exists(q, User.class);
				if(exists != false) {
					res.put(resultKeys[0], ServiceResults.ServiceResults_VALIDERR.ordinal());
					
					return getResult(res);
				}
				usero = new User();
				usero.adid = adid;
				//usero.notifyRegId = notifyRegId;
				usero.imageName = imageName;
				usero.fullName = name;
				usero.nickName = nickname;
				usero.keywords = new HashSet<String>();
				usero.keywords.addAll(kws);
				//usero.opentokSessId = webRtcInst.createSession();
				//usero.opentokToken = webRtcInst.createToken(usero.opentokSessId, Room.StreamType.StreamType_Publish, adid);
				mongoOperationsUSER.save(usero);
				res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
				res.put(resultKeys[1], "OK");
				matcherImpl.RunMatch(EMatchType.MatchType_User_KWS, usero, false);
				return getResult(res);
			}
			if(name != null)
				mongoOperationsUSER.updateFirst(query(where("adid").is(adid)), new Update().set("userName", name), User.class);
			if(nickname != null)
				mongoOperationsUSER.updateFirst(query(where("adid").is(adid)), new Update().set("nickName", nickname), User.class);
			if(imageName != null)
				mongoOperationsUSER.updateFirst(query(where("adid").is(adid)), new Update().set("imageName", imageName), User.class);
			if(kws != null) {
				if(usero.keywords == null)
					usero.keywords = new HashSet<String>();
				usero.keywords.addAll(kws);
				mongoOperationsUSER.updateFirst(query(where("adid").is(adid)), new Update().set("keywords", kws), User.class);
				matcherImpl.RunMatch(EMatchType.MatchType_User_KWS, usero, true);
			}
			res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
			//imageName is the last step of the new profile - we need to save the actual URL
			// due to the browser restrictions for accessing full filepath locally!
			if(imageName == null)
				res.put(resultKeys[1], "OK");
			else {
				Map<String, Object> res1 = new HashMap<String, Object>();
				
				//TODO: encrypt the following actually with logintoken
				res1.put(ApiFields.ModelId, usero.id);
				res1.put(ApiFields.ProfileImageURL, imageName);
				
				res.put(resultKeys[1], mapper.writeValueAsString(res1));
			}
			
		} catch (JsonParseException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
			res.put(resultKeys[1], e1.getMessage());
			return getResult(res);
		} catch (JsonMappingException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
			res.put(resultKeys[1], e1.getMessage());
			return getResult(res);
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
			res.put(resultKeys[1], e1.getMessage());
			return getResult(res);
		} /*catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
			res.put(resultKeys[1], e1.getMessage());
			return getResult(res);
		}*/
		
		return getResult(res);
	}
	
	public String removeuser(String adid, String data)
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], null);
		res.put(resultKeys[1], "Invalid");
		
		try {
			Map<String, Object> vals = mapper.readValue(data, Map.class);
			
			
			
			try {
				
				
				
				assert adid != null : "no adid";
				
			} catch (AssertionError e) {
				res.put(resultKeys[1], e.getMessage());
				return getResult(res);
			}
			
			
			mongoOperationsUSER.remove(query(where("adid").is(adid)), User.class);
			res.put(resultKeys[1], "OK");
			res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
			//res.put(resultKeys[1], "OK");
			return getResult(res);
			
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return getResult(res);
	}
	
	public String getUser(String adid, String data, boolean raw)
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], null);
		res.put(resultKeys[1], "Invalid");
		
		try {
			Map<String, Object> vals = mapper.readValue(data, Map.class);
			
			//String page = (Integer) vals.get(ApiFields.Page);
			String userId = (String) vals.get(ApiFields.UserId);
			
			try {
				
				assert (userId == null)  : "no page";
				
				assert adid == null : "no adid";
				//assert userId == null : "no userId";
				
			} catch (AssertionError e) {
				res.put(resultKeys[1], e.getMessage());
				return getResult(res);
			}
			
			Query q = query(where("id").is(userId));
			//q.fields().include("id").include();
			q.fields().exclude("refUsersFW").exclude("refUsersKWs").exclude("refUsersOneWay").exclude("notifyRegId");
			User usero = mongoOperationsUSER.findOne(q, User.class);
			if(usero == null) {
				LOG.info("No such user found: " + adid);
				res.put(resultKeys[1], "No such user found: " + adid);
				return getResult(res);
			}
			/*if(usero.id.equals(userId) != true) {
				LOG.info("Invalid user received: " + userId);
				res.put(resultKeys[1], "Invalid user received: " + userId);
				return getResult(res);
			}*/
			boolean thisUser = (adid.contentEquals(usero.adid)) != false ;
			if(thisUser != true) {
				usero.adid = null;
				usero.loginToken = null;
				//usero.usersCredits = null;
			}
			/*else {
				usero.opentokToken = webRtcInst.createToken(usero.opentokSessId, Room.StreamType.StreamType_Publish, adid);
				mongoOperationsUSER.updateFirst(query(where("id").is(userId)), new Update().set("opentokToken", usero.opentokToken), User.class);
			}*/
			String userJSON = mapper.writeValueAsString(usero);
			
			if(raw != false)
				return userJSON;
			
			//TODO: encrypt the following actually with logintoken
			
			
			
			res.put(resultKeys[1], userJSON);
			res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
			//res.put(resultKeys[1], "OK");
			return getResult(res);
			
			
			
			
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return getResult(res);
	}
	
	public String openroom(String adid, String data)
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], null);
		res.put(resultKeys[1], "Invalid");
		
		try {
			
			Room room1 = mapper.readValue(data, Room.class);
			
			//Room room1 = room2;
			/*String roomId = (String) vals.get(ApiFields.ModelId);
			String roomname = (String) vals.get(ApiFields.RoomName);
			String descr = (String) vals.get(ApiFields.Description);
			String imageName = (String) vals.get(ApiFields.ProfileImage);
			List<String> kws = (List<String>) vals.get(ApiFields.Keywords);
			List<String> publishers = (List<String>) vals.get(ApiFields.Publishers);
			Integer searchMode = (Integer) vals.get(ApiFields.SearchMode);
			Boolean roomPairCombinationMode = (Boolean) vals.get(ApiFields.SearchCombinationMode);
			Boolean enableRoom = (Boolean) vals.get(ApiFields.EnableRoom);
			Boolean created = (Boolean) vals.get(ApiFields.Create);*/
			try {
				
				//assert ((roomId == null) && (roomname == null)) : "no roomname";
				
				assert adid != null : "no adid";
				//assert ((roomId == null) && (searchMode == null)) : "no searchtype specified";
				//assert ((publishers != null) || (publishers.isEmpty() != true)) : "no publishers";
				
			} catch (AssertionError e) {
				res.put(resultKeys[1], e.getMessage());
				return getResult(res);
			}
			
			Room room = null;
			if(room1.id != null) {
				Query q = query(where("id").is(room1.id));
				//q.fields().include("id").include("create").include("name").include("enabled").include("keywords");
				room = mongoOperationsP2P.findOne(q, Room.class);
				if(room == null)
				{
					LOG.info("Room does not exist: " + room1.id);
					res.put(resultKeys[1], "Room does not exist: " + room1.id);
					return getResult(res);
				}
				if(room1.create == null)
					room1.create = true;
				if((room1.create != true) && (room.create != false)) {
					LOG.info("Room finalized: " + room1.id);
					
					
					mongoOperationsP2P.updateFirst(q, new Update().set("create", room1.create), Room.class);
					res.put(resultKeys[1], "Room finalized: " + room1.name);
					res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
					matcherImpl.RunMatch(EMatchType.MatchType_Room_KWS, room, false);
					return getResult(res);
				}
				/*if((room.enabled != false) && (room1.create != true)) {
					LOG.info("Room is already enabled. Cannot be changed: " + room1.id);
					res.put(resultKeys[1], "Room is already enabled. Cannot be changed: " + room1.id);
					return getResult(res);
				}*/
				else if(room1.images != null) {
					for(String img: room1.images) {
						mongoOperationsP2P.updateFirst(q, new Update().addToSet("images", img), Room.class);
					}
				}
				else if((room1.enabled != null) && (room1.create != true)) {
					mongoOperationsP2P.updateFirst(q, new Update().set("enabled", room1.enabled), Room.class);
					matcherImpl.RunMatch(EMatchType.MatchType_Room_KWS, room, true);
				}
				else {
					LOG.info("Room data integrity error: " + room1.id);
					res.put(resultKeys[1], "Invalid submission for enabling/disabling room:" + room.name);
					return getResult(res);
				}
				res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
				res.put(resultKeys[1], "OK");
			}
			else {
				Query q = query(where("name").is(room1.name));
				boolean exists = mongoOperationsP2P.exists(q, Room.class);
				if(exists != false) {
					res.put(resultKeys[0], ServiceResults.ServiceResults_VALIDERR.ordinal());
					
					return getResult(res);
				}
				Map<String, Object> vals = mapper.readValue(data, Map.class);
				Integer searchMode = (Integer) vals.get(ApiFields.SearchMode);	
				room1.searchMode = SortSearchMode.values()[searchMode];
				
				q = query(where("adid").is(adid));
				//q.fields().include("id");
				User usero = mongoOperationsUSER.findOne(q, User.class);
				
				if(usero == null) {
					LOG.info("No such user: " + adid);
					res.put(resultKeys[1], "No such user: " + adid);
					return getResult(res);
				}
				
				room = room1;
				room.userId = usero.id;
				
				room.opentokSessId = webRtcInst.createSession();
				room.createTime = new Date();
				mongoOperationsP2P.save(room); 
				Map<String, String> res1 = new HashMap<String, String>();
				
				//TODO: encrypt the following actually with logintoken
				//res1.put(ApiFields.OT_ROOM_SESS_ID, room.opentokSessId);
				res1.put(ApiFields.ModelId, room.id);
				
				res.put(resultKeys[1], mapper.writeValueAsString(res1));
				res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
			}
			
			//if(descr != null) room.description = descr;
			//if(roomname != null) room.name = roomname;
			
			//room.opentokSessId = opentok.createSession().getSessionId();
			//room.publishersNeeded = new HashSet<String>();
			//TODO fix this mapping
			
			/*if(publishers != null) {
				for(Entry<String, Integer> objs: publishers.entrySet())
				{
					
					String pub = (String) objs.getKey();
					Integer cred = (Integer) objs.getValue();
					
					CreditsPush credEntry = new CreditsPush();
					credEntry.paidByPub = cred;
					room.pubAuth.put(pub, (cred >= 0 ? credEntry : null));
				}
			}*/
			/*if(publishers != null) {
				if(room.pubAuth == null)
					room.pubAuth = new HashMap<String, CreditsPush>();
				for(String pub: publishers)
				{
					room.pubAuth.put(pub,  null);
				}
			}*/
			
			/*if(kws != null) {
				if(room.keywords == null)
					room.keywords = new HashSet<String>();
				room.keywords.addAll(kws);
			}*/
			//if(roomPairCombinationMode != null) room.roomPairCombinationMode = RoomPairCombinationMode.values()[roomPairCombinationMode];
			//if(roomPairCombinationMode != null) room.roomPairCombinationMode = roomPairCombinationMode;
			//if(searchMode != null) room.searchMode = RoomPairMode.values()[searchMode];
			/*if(imageName != null) {
				if(room.images == null)
					room.images = new ArrayList<String>();
				room.images.add(imageName);
			}*/
			//if(enableRoom != null) room.enabled = enableRoom;
			
			/*mongoOperationsP2P.save(room); 
			res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
			if(room1.create != false) {
				Map<String, String> res1 = new HashMap<String, String>();
				
				//TODO: encrypt the following actually with logintoken
				res1.put(ApiFields.OT_ROOM_SESS_ID, room.opentokSessId);
				res1.put(ApiFields.ModelId, room.id);
				
				res.put(resultKeys[1], mapper.writeValueAsString(res1));
			}
			else {
			
			//res.put(resultKeys[1], room.opentokSessId);
				res.put(resultKeys[1], "OK");
				
			}*/
			
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
			return getResult(res);
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
			return getResult(res);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
			return getResult(res);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
			return getResult(res);
		}
		return getResult(res);
	}
	
	public String removeroom(String adid, String data)
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], null);
		res.put(resultKeys[1], "Invalid");
		
		try {
			Map<String, Object> vals = mapper.readValue(data, Map.class);
			
			String roomId = (String) vals.get(ApiFields.ModelId);
			
			try {
				
				assert (roomId == null)  : "no roomid";
				
				assert adid != null : "no adid";
				
			} catch (AssertionError e) {
				res.put(resultKeys[1], e.getMessage());
				return getResult(res);
			}
			
			
			if(roomId != null) {
				
				mongoOperationsP2P.remove(query(where("id").is(roomId)), Room.class);
				res.put(resultKeys[1], "OK");
				res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
				//res.put(resultKeys[1], "OK");
				return getResult(res);
			}
			else {
				LOG.info("No room id specified: " + adid);
				res.put(resultKeys[1], "Invalid arguments: " + adid);
				return getResult(res);
				
			} 
			
			
			
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return getResult(res);
	}
	
	public String followmodel(String adid, String data)
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], null);
		res.put(resultKeys[1], "Invalid");
		
		try {
			/*Map<String, Object> vals = mapper.readValue(data, Map.class);
			
			String targetId = (String) vals.get(ApiFields.ModelId);
			String sourceId = (String) vals.get(ApiFields.ModelId);
			Integer followTypeVal = (Integer) vals.get(ApiFields.FollowType);
			FollowType followType = FollowType.values()[followTypeVal];
			Boolean follow = (Boolean) vals.get(ApiFields.Follow);*/
			
			Follows follows = mapper.readValue(data, Follows.class);
			
			try {
				
				/*assert (targetId == null) : "no model Id";
				assert (followType == null)  : "no follow type";
				assert (follow == null) : "no follow";*/
				assert adid != null : "no adid";
				
			} catch (AssertionError e) {
				res.put(resultKeys[1], e.getMessage());
				return getResult(res);
			}
			
			Query q = query(where("adid").is(adid));
			q.fields().include("id");
			User usero = mongoOperationsUSER.findOne(q, User.class);
			if(usero == null) {
				LOG.info("No such user found: " + adid);
				res.put(resultKeys[1], "No such user found: " + adid);
				return getResult(res);
			}
			follows.sourceId = usero.id;
			Follows.FollowsImpl followsimpl = follows.getFollowsImpl();
			if(followsimpl.targetId != null){
				
				
				//boolean exists = false;
				switch(followsimpl.followType) {
				case FollowType_UserTORoom:
					q = query(where("id").is(followsimpl.targetId));
					if(followsimpl.following != false) {
						mongoOperationsP2P.updateFirst(q, new Update().addToSet("refRoomsFW", followsimpl.sourceId), Room.class);
					}
					else {
						mongoOperationsP2P.updateFirst(q, new Update().pull("refRoomsFW", followsimpl.sourceId), Room.class);
					}
					matcherImpl.RunMatch(EMatchType.MatchType_Room_FW, followsimpl.targetId, followsimpl.sourceId, !followsimpl.following);
					break;
				/*case FollowType_RoomTOUser:
					q = query(where("id").is(followsimpl.sourceId));
					
					if(followsimpl.following != false) 
						mongoOperationsP2P.updateFirst(q, new Update().addToSet("refRoomsFW", followsimpl.targetId).pull("refRoomsOneWay", followsimpl.targetId), Room.class);
					else
						mongoOperationsP2P.updateFirst(q, new Update().pull("refRoomsFW", followsimpl.targetId).addToSet("refRoomsOneWay", followsimpl.targetId), Room.class);
					break;*/
				case FollowType_UserTOUser:
					if(followsimpl.following != false) {
						query(where("id").is(followsimpl.targetId));
						mongoOperationsUSER.updateFirst(q, new Update().addToSet("refUsersFW", followsimpl.sourceId), User.class);
						//q = query(where("id").is(followsimpl.sourceId));
						//mongoOperationsUSER.updateFirst(q, new Update().addToSet("refRoomsFW", followsimpl.targetId).pull("refRoomsOneWay", followsimpl.targetId), User.class);
					}
					else {
						query(where("id").is(followsimpl.targetId));
						mongoOperationsUSER.updateFirst(q, new Update().pull("refUsersFW", followsimpl.sourceId), User.class);
						//q = query(where("id").is(followsimpl.sourceId));
						//mongoOperationsUSER.updateFirst(q, new Update().pull("refRoomsFW", followsimpl.targetId).addToSet("refRoomsOneWay", followsimpl.targetId), User.class);
					}
					/*q = query(where("id").is(followsimpl.targetId).andOperator(where("refUsersOneWay").is(followsimpl.sourceId)));
					boolean first = mongoOperationsUSER.exists(q, User.class);
					if(first != false) {
						if(followsimpl.following != false) {
							query(where("id").is(followsimpl.targetId));
							mongoOperationsUSER.updateFirst(q, new Update().addToSet("refRoomsFW", followsimpl.sourceId).pull("refRoomsOneWay", followsimpl.sourceId), User.class);
							//q = query(where("id").is(followsimpl.sourceId));
							//mongoOperationsUSER.updateFirst(q, new Update().addToSet("refRoomsFW", followsimpl.targetId).pull("refRoomsOneWay", followsimpl.targetId), User.class);
						}
						else {
							query(where("id").is(followsimpl.targetId));
							mongoOperationsUSER.updateFirst(q, new Update().pull("refRoomsFW", followsimpl.sourceId).addToSet("refRoomsOneWay", followsimpl.sourceId), User.class);
							//q = query(where("id").is(followsimpl.sourceId));
							//mongoOperationsUSER.updateFirst(q, new Update().pull("refRoomsFW", followsimpl.targetId).addToSet("refRoomsOneWay", followsimpl.targetId), User.class);
						}
						
					}
					else {
						if(followsimpl.following != false) {
							query(where("id").is(followsimpl.targetId));
							mongoOperationsUSER.updateFirst(q, new Update().addToSet("refRoomsOneWay", followsimpl.sourceId), User.class);
							//query(where("id").is(followsimpl.targetId));
							//mongoOperationsUSER.updateFirst(q, new Update().addToSet("refRoomsOneWay", user1), User.class);
						}
						else {
							query(where("id").is(followsimpl.targetId));
							mongoOperationsUSER.updateFirst(q, new Update().pull("refRoomsOneWay", followsimpl.sourceId), User.class);
							//q = query(where("id").is(targetId));
							//mongoOperationsUSER.updateFirst(q, new Update().pull("refRoomsOneWay", user1), User.class);
						}
					}*/
					matcherImpl.RunMatch(EMatchType.MatchType_User_FW, followsimpl.targetId, followsimpl.sourceId, !followsimpl.following);
					break;
					
				}
				
				
				res.put(resultKeys[1], "OK");
				res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
				//res.put(resultKeys[1], "OK");
				return getResult(res);
			}
			else {
				LOG.info("No room id specified: " + adid);
				res.put(resultKeys[1], "Invalid arguments: " + adid);
				return getResult(res);
				
			} 
			
			
			
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return getResult(res);
	}
	
	public String listroom(String adid, String data)
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], null);
		res.put(resultKeys[1], "Invalid");
		
		try {
			Map<String, Object> vals = mapper.readValue(data, Map.class);
			
			Integer page = (Integer) vals.get(ApiFields.Page);
			//String userId = (String) vals.get(ApiFields.ModelId);
			Integer sortOrderVal = (Integer) vals.get(ApiFields.SortOrder);
			SortOrder sortOrder = SortOrder.values()[sortOrderVal]; 
			Integer sortOnVal = (Integer) vals.get(ApiFields.SortOn);
			SortBy sortOn = SortBy.values()[sortOnVal];
			
			String sortData = (String) vals.get(ApiFields.SortData);

			try {
				
				assert (page == null)  : "no page";
				
				assert adid == null : "no adid";
				//assert userId == null : "no userId";
				
			} catch (AssertionError e) {
				res.put(resultKeys[1], e.getMessage());
				return getResult(res);
			}
			
			Query q = query(where("adid").is(adid));
			q.fields().include("id");
			User usero = mongoOperationsUSER.findOne(q, User.class);
			if(usero == null) {
				LOG.info("No such user found: " + adid);
				res.put(resultKeys[1], "No such user found: " + adid);
				return getResult(res);
			}
			/*if(usero.id.equals(userId) != true) {
				LOG.info("Invalid user received: " + userId);
				res.put(resultKeys[1], "Invalid user received: " + userId);
				return getResult(res);
			}*/
			
			
			
			String sortKey = Room.sortOnMap.get(sortOn);
			/*if(sortOn.ordinal() == Room.RoomSortBy.RoomSortBy_Date.ordinal())
				sortKey = "createTime";
			else if(sortOn.ordinal() == Room.RoomSortBy.RoomSortBy_UserNN.ordinal())
				sortKey = "userId";//this is not a real sort by nickname below
									//more a sort by userId
									// TODO: do it by NN - may need a map-reduce cycle for that
								
									 */
			if(sortKey != null) {
				PageRequest request = new PageRequest(page, LISTING_LIMIT, new Sort(sortOrder == SortOrder.SortOrder_ASC ? Direction.ASC : Direction.DESC, sortKey));
				q.with(request);
			}
			
			q = query(where("userId").is(usero.id));
			q.fields().exclude("refPubs").exclude("refSubs").exclude("refPubsCount");
			
			List<Room> rooms = mongoOperationsP2P.find(q, Room.class);
			if(rooms == null)
			{
				LOG.info("No rooms exist: " + adid);
				res.put(resultKeys[1], "No rooms exist: " + adid);
				res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
				return getResult(res);
			}
			if(rooms.isEmpty() != false) {
				res.put(resultKeys[0], ServiceResults.ServiceResults_EMPTY.ordinal());
				return getResult(res);
			}
			List<ExtRoom> extRooms = getExtRooms(rooms, null);
			String roomsJSON = mapper.writeValueAsString(extRooms);
			
			
			//TODO: encrypt the following actually with logintoken
			
			
			
			res.put(resultKeys[1], roomsJSON);
			res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
			//res.put(resultKeys[1], "OK");
			//return getResult(res);
			
			
			
			
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
			return getResult(res);
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
			return getResult(res);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
			return getResult(res);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
			return getResult(res);
		}
		return getResult(res);
	}
	
	public String pubCandidates(String adid, String data)
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], null);
		res.put(resultKeys[1], "Invalid");
		
		try {
			Map<String, Object> vals = mapper.readValue(data, Map.class);
			
			Integer page = (Integer) vals.get(ApiFields.Page);
			Integer sortFilterVal = (Integer) vals.get(ApiFields.SearchMode);
			SortSearchMode sortFilter = SortSearchMode.values()[sortFilterVal]; 
			Integer sortOrderVal = (Integer) vals.get(ApiFields.SortOrder);
			SortOrder sortOrder = SortOrder.values()[sortOrderVal]; 
			Integer sortOnVal = (Integer) vals.get(ApiFields.SortOn);
			SortBy sortOn = SortBy.values()[sortOnVal];
			
			String sortData = (String) vals.get(ApiFields.SortData);
			//String userId = (String) vals.get(ApiFields.ModelId);
			
			try {
				
				assert (page == null)  : "no page";
				
				assert adid == null : "no adid";
				//assert userId == null : "no userId";
				
			} catch (AssertionError e) {
				res.put(resultKeys[1], e.getMessage());
				return getResult(res);
			}
			
			Query q = query(where("adid").is(adid));
			//q.fields().include("id").include("refRoomsFW").include("refRoomsKWs").include("refUsersFW").include("refUsersKWs").include("publishersNeeded");
			q.fields().include("id");
			User usero = mongoOperationsUSER.findOne(q, User.class);
			if(usero == null) {
				LOG.info("No such user found: " + adid);
				res.put(resultKeys[1], "No such user found: " + adid);
				return getResult(res);
			}
			/*if(usero.id.equals(userId) != true) {
				LOG.info("Invalid user received: " + userId);
				res.put(resultKeys[1], "Invalid user received: " + userId);
				return getResult(res);
			}*/
			q = new Query();
			
			switch(sortFilter) {
			case SortPairMode_ANY:
				
				q = query(where("searchMode").is(SortSearchMode.SortPairMode_ANY).andOperator(where("enabled").is(true)));
				break;
			case SortPairMode_MATCHING:
				q = query(where("enabled").is(true).andOperator(where("refRoomsKWs").is(usero.id).orOperator(where("refUsersKWs").is(usero.id))));
				
				break;
			/*case SortPairMode_ONEWAYFOLLOW:
				q = query(where("enabled").is(true).andOperator(where("refRoomsOneWay").is(usero.id).orOperator(where("refUsersOneWay").is(usero.id))));
				
				break;*/
			case SortPairMode_CONNECTIONS:
				q = query(where("enabled").is(true).andOperator(where("refRoomsFW").is(usero.id).orOperator(where("refUsersFW").is(usero.id))));
				break;
			case SortPairMode_THISUSERS:
				q = query(where("enabled").is(true).andOperator(where("searchMode").is(SortSearchMode.SortPairMode_THISUSERS).andOperator((sortOn == SortBy.SortBy_Pub ? where("publishersNeeded").is(usero.id) : where("credits.pubUserId").is(usero.id).orOperator(where("credits.pubUserId").exists(true))))));
				break;
			/*case SortBy_Credit:
				q = query(where("target.enabled").is(true).andOperator(where("target.credits.pubUserId").is(usero.id).orOperator(where("target.credits.pubUserId").exists(true))));
				break;*/
			
			}
			if(sortData != null) {
				q.addCriteria(where("name").regex(sortData).orOperator(where("description").regex(sortData)).orOperator(where("keywords").in(Pattern.compile(sortData))));
			}
			
			
			
			String sortKey = Room.sortOnMap.get(sortOn);
			PageRequest request;
			if(sortKey != null) {
				request = new PageRequest(page, LISTING_LIMIT, new Sort(sortOrder == SortOrder.SortOrder_ASC ? Direction.ASC : Direction.DESC, sortKey));
				
			}
			else 
				request = new PageRequest(page, LISTING_LIMIT, new Sort(sortOrder == SortOrder.SortOrder_ASC ? Direction.ASC : Direction.DESC));
			q.with(request);
			//q.fields().exclude("refPubs").exclude("refSubs").exclude("refRoomsKWs").exclude("refRoomsOneWay").exclude("refRoomsFW").exclude("refUsersOneWay").exclude("refUsersKWs").exclude("refUsersFW");
			q.fields().exclude("refPubs").exclude("refSubs").exclude("refRoomsKWs").exclude("refRoomsFW").exclude("refUsersKWs").exclude("refUsersFW");
			//q.fields().include("target");
			List<Room> rooms = mongoOperationsP2P.find(q, Room.class);
			
			if(rooms.isEmpty() != false){
				res.put(resultKeys[0], ServiceResults.ServiceResults_EMPTY.ordinal());
				/*if(sortData == null) {
					q = query(where("enabled").is(true));
					if(sortKey != null) {
						request = new PageRequest(page, LISTING_LIMIT, new Sort(sortOrder == SortOrder.SortOrder_ASC ? Direction.ASC : Direction.DESC, sortKey));
						
					}
					else 
						request = new PageRequest(page, LISTING_LIMIT, new Sort(sortOrder == SortOrder.SortOrder_ASC ? Direction.ASC : Direction.DESC));
					q.with(request);
					q.fields().exclude("refPubs").exclude("refSubs").exclude("refRoomsKWs").exclude("refRoomsOneWay").exclude("refRoomsFW").exclude("refUsersOneWay").exclude("refUsersKWs").exclude("refUsersFW");
					
					rooms = mongoOperationsP2P.find(q, Room.class);
					if(rooms.isEmpty() != false)
						return getResult(res);
				}
				else {
					
					return getResult(res);
				}*/
				return getResult(res);
				
			}
			
			
			List<ExtRoom> extRooms = getExtRooms(rooms, usero.id);
			String roomsJSON = mapper.writeValueAsString(extRooms);
			
			
			//TODO: encrypt the following actually with logintoken
			
			
			
			res.put(resultKeys[1], roomsJSON);
			res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
			//res.put(resultKeys[1], "OK");
			//return getResult(res);
			
			
			
			
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
			return getResult(res);
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
			return getResult(res);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
			return getResult(res);
		}
		catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
			return getResult(res);
		}
		return getResult(res);
	}
	
	public String activeSubCandidates(String adid, String data)
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], null);
		res.put(resultKeys[1], "Invalid");
		
		try {

			Map<String, Object> vals = mapper.readValue(data, Map.class);
			
			Integer page = (Integer) vals.get(ApiFields.Page);
			//String userId = (String) vals.get(ApiFields.ModelId);
			Integer sortFilterVal = (Integer) vals.get(ApiFields.SearchMode);
			SortSearchMode sortFilter = SortSearchMode.values()[sortFilterVal];
			Integer sortOrderVal = (Integer) vals.get(ApiFields.SortOrder);
			SortOrder sortOrder = SortOrder.values()[sortOrderVal]; 
			Integer sortOnVal = (Integer) vals.get(ApiFields.SortOn);
			SortBy sortOn = SortBy.values()[sortOnVal];
			
			String sortData = (String) vals.get(ApiFields.SortData);
			try {
				
				assert (page == null)  : "no page";
				
				assert adid == null : "no adid";
				//assert userId == null : "no userId";
				
			} catch (AssertionError e) {
				res.put(resultKeys[1], e.getMessage());
				return getResult(res);
			}
			
			Query q = query(where("adid").is(adid));
			q.fields().include("id");
			User usero = mongoOperationsUSER.findOne(q, User.class);
			if(usero == null) {
				LOG.info("No such user found: " + adid);
				res.put(resultKeys[1], "No such user found: " + adid);
				return getResult(res);
			}
			/*if(usero.id.equals(userId) != true) {
				LOG.info("Invalid user received: " + userId);
				res.put(resultKeys[1], "Invalid user received: " + userId);
				return getResult(res);
			}*/
			
			/*q = new Query();
			switch(sortOn) {
			case RoomSortBy_Date:
			case RoomSortBy_UserNN:
			case RoomSortBy_Name:
				break;
			case RoomSortBy_Pub:
				q = query(where("enabled").is(true).andOperator(where("searchMode").is(RoomPairMode.RoomPairMode_THISUSERS).andOperator(where("publishersNeeded").is(usero.id))));
				break;
			case RoomSortBy_Credit:
				q = query(where("enabled").is(true).andOperator(where("credits.pubUserId").is(usero.id).orOperator(where("credits.pubUserId").exists(true))));
				break;
			case RoomSortBy_ANY:
				q = query(where("enabled").is(true));
				
				break;
			}
			if(sortData != null) {
				q.addCriteria(where("name").regex(sortData).orOperator(where("description").regex(sortData)).orOperator(where("keywords").in(Pattern.compile(sortData))));
			}
			
			
			String sortKey = Room.sortOnMap.get(sortOn);
			
			if(sortKey != null) {
				PageRequest request = new PageRequest(page, LISTING_LIMIT, new Sort(sortOrder == SortOrder.SortOrder_ASC ? Direction.ASC : Direction.DESC, sortKey));
				q.with(request);
			}
			q.addCriteria(where("refPubsCount").gt(0));
			
			q.fields().exclude("refPubs").exclude("refSubs").exclude("refPubsCount");*/
			
			q = new Query();
			
			switch(sortFilter) {
			case SortPairMode_ANY:
				
				q = query(where("searchMode").is(SortSearchMode.SortPairMode_ANY).andOperator(where("enabled").is(true)));
				break;
			case SortPairMode_MATCHING:
				q = query(where("enabled").is(true).andOperator(where("refRoomsKWs").is(usero.id).orOperator(where("refUsersKWs").is(usero.id))));
				
				break;
			/*case SortPairMode_ONEWAYFOLLOW:
				q = query(where("enabled").is(true).andOperator(where("refRoomsOneWay").is(usero.id).orOperator(where("refUsersOneWay").is(usero.id))));
				
				break;*/
			case SortPairMode_CONNECTIONS:
				q = query(where("enabled").is(true).andOperator(where("refRoomsFW").is(usero.id).orOperator(where("refUsersFW").is(usero.id))));
				break;
			case SortPairMode_THISUSERS:
				q = query(where("enabled").is(true).andOperator(where("searchMode").is(SortSearchMode.SortPairMode_THISUSERS).andOperator((sortOn == SortBy.SortBy_Pub ? where("publishersNeeded").is(usero.id) : where("credits.pubUserId").is(usero.id).orOperator(where("credits.pubUserId").exists(true))))));
				break;
			/*case SortBy_Credit:
				q = query(where("target.enabled").is(true).andOperator(where("target.credits.pubUserId").is(usero.id).orOperator(where("target.credits.pubUserId").exists(true))));
				break;*/
			
			}
			if(sortData != null) {
				q.addCriteria(where("name").regex(sortData).orOperator(where("description").regex(sortData)).orOperator(where("keywords").in(Pattern.compile(sortData))));
			}
			
			String sortKey = Room.sortOnMap.get(sortOn);
			PageRequest request;
			if(sortKey != null) {
				request = new PageRequest(page, LISTING_LIMIT, new Sort(sortOrder == SortOrder.SortOrder_ASC ? Direction.ASC : Direction.DESC, sortKey));
				
			}
			else 
				request = new PageRequest(page, LISTING_LIMIT, new Sort(sortOrder == SortOrder.SortOrder_ASC ? Direction.ASC : Direction.DESC));
			q.with(request);
			q.addCriteria(where("refPubsCount").gt(0));
			//q.fields().exclude("refPubs").exclude("refSubs").exclude("refRoomsKWs").exclude("refRoomsOneWay").exclude("refRoomsFW").exclude("refUsersOneWay").exclude("refUsersKWs").exclude("refUsersFW");
			q.fields().exclude("refPubs").exclude("refSubs").exclude("refRoomsKWs").exclude("refRoomsFW").exclude("refUsersKWs").exclude("refUsersFW");
			//q.fields().include("target");
			List<Room> rooms = mongoOperationsP2P.find(q, Room.class);
			/*if(rooms == null)
			{
				LOG.info("No rooms exist: " + adid);
				res.put(resultKeys[1], "No rooms exist: " + adid);
				res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
				return getResult(res);
			}*/
			if(rooms.isEmpty() != false) {
				res.put(resultKeys[0], ServiceResults.ServiceResults_EMPTY.ordinal());
				/*if(sortData == null) {
					q = query(where("enabled").is(true).andOperator(where("refPubsCount").gt(0)));
					q.fields().exclude("refPubs").exclude("refSubs").exclude("refPubsCount");
					
					rooms = mongoOperationsP2P.find(q, Room.class);
				}
				else {
					
					return getResult(res);
				}*/
				return getResult(res);
			}
			
			List<ExtRoom> extRooms = getExtRooms(rooms, usero.id);
			String roomsJSON = mapper.writeValueAsString(extRooms);
			
			
			//TODO: encrypt the following actually with logintoken
			
			
			
			res.put(resultKeys[1], roomsJSON);
			res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
			//res.put(resultKeys[1], "OK");
			return getResult(res);
			
			
			
			
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		}
		return getResult(res);
	}
	
	public String startSession(String adid, String data)
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], null);
		res.put(resultKeys[1], "Invalid");
		
		try {
			Map<String, Object> vals = mapper.readValue(data, Map.class);
			
			//String page = (Integer) vals.get(ApiFields.Page);
			String roomId = (String) vals.get(ApiFields.ModelId);
			Integer streamType = (Integer) vals.get(ApiFields.StreamType);
			Room.StreamType streamTypeE = Room.StreamType.values()[streamType];
			Boolean fullview = (Boolean) vals.get(ApiFields.Fullview);
			CreditsPush credits = (CreditsPush) vals.get(ApiFields.Credits);
			try {
				
				assert (roomId == null)  : "no room";
				//assert (userId == null)  : "no userId";
				assert (streamType == null)  : "no stream type";
				
				assert adid == null : "no adid";
				//assert userId == null : "no userId";
				
			} catch (AssertionError e) {
				res.put(resultKeys[1], e.getMessage());
				return getResult(res);
			}
			
			Room room = null;
			if(roomId != null) {
				Query q = query(where("id").is(roomId));
				q.fields().include("id").include("userId").include("name").include("images").include("MainImageIdx").include("opentokSessId");
				room = mongoOperationsP2P.findOne(q, Room.class);
				if( room == null) {
					LOG.info("No such room: " + roomId);
					res.put(resultKeys[1], "No such room:  " + roomId);
					return getResult(res);
				}
			}
			else {
				LOG.info("No room id specified: " + adid);
				res.put(resultKeys[1], "Invalid arguments: " + adid);
				return getResult(res);
				
			} 
			
			Query q = query(where("adid").is(adid));
			q.fields().include("id").include("nickName").include("imageName");
			User usero = mongoOperationsUSER.findOne(q, User.class);
			if(usero == null) {
				LOG.info("No such user found: " + adid);
				res.put(resultKeys[1], "No such user found: " + adid);
				return getResult(res);
			}
			//if(streamTypeE == Room.StreamType.StreamType_Publish) {
				//q = new Query(where("searchMode").ne(RoomPairMode.RoomPairMode_THISUSERS).orOperator(where("creditsMap.userId").is(usero.id).orOperator(where("creditsMap.userId").exists(false).andOperator(where("creditsMap.credit").exists(true)))));
				
				/*Query q = query(where("id").is(room.id).andOperator(where("refUsers").in(adid)));
				q.fields().include("id").include("refSubs");
				usero = mongoOperationsUSER.findOne(q, User.class);
				if(usero == null) {
					LOG.info("No permission to stream: " + adid);
					res.put(resultKeys[0], ServiceResults.ServiceResults_FAIL.ordinal());
					res.put(resultKeys[1], "No permission to stream: " + adid);
					return getResult(res);
				}*/
			//}
			/*else if(streamTypeE == Room.StreamType.StreamType_Subscribe) {
				Query q = query(where("id").is(adid));
				q.fields().include("id").include("refPubs");
				usero = mongoOperationsUSER.findOne(q, User.class);
				if(usero == null) {
					LOG.info("No such user: " + adid);
					
					res.put(resultKeys[1], "No such user: " + adid);
					return getResult(res);
				}
			}
			*/
			
			
			TokenGen tokenGen = new TokenGen();
			SubscribeData subData = new SubscribeData();
			subData.uid = usero.id;
			subData.nickName = usero.nickName;
			subData.imageName = usero.imageName;
			subData.fullview = fullview;
			String tokenData = mapper.writeValueAsString(subData);
			String token = webRtcInst.createToken(room.opentokSessId, streamTypeE, tokenData);
			tokenGen.session = room.opentokSessId;
			tokenGen.token = token;
			tokenGen.pubPays = false;
			
			
			
			switch(streamTypeE) {
			case StreamType_Publish:
				Update update = new Update();
				update.addToSet("refPubs", usero.id).inc("refPubsCount", 1);
				if(credits != null) {
					credits.pubUserId = usero.id;
					tokenGen.credits = credits;
					update.addToSet("credits", credits);
					tokenGen.pubPays = true;
				}
				
				q = query(where("id").is(roomId));
				mongoOperationsP2P.updateFirst(q, update, Room.class);
				break;
			case StreamType_Subscribe:
				SessionInstance sessInst = new SessionInstance();
				sessInst.streamType = streamTypeE;
				sessInst.userId = usero.id;
				sessInst.roomId = room.id;
				sessInst.start = new Date();
				mongoOperationsP2P.save(sessInst);
				tokenGen.sessionInstance = sessInst.id;
				update = new Update();
				update.addToSet("refSubs", usero.id);
				q = query(where("id").is(roomId));
				mongoOperationsP2P.updateFirst(q, update, Room.class);
				if(credits != null) {
					switch(credits.creditMode)
					{
					case CreditsMode_ANY:
						
						if(credits.maxAllowed < 0) {
							//client should check if this is true with indexing the 
							// CreditPush array for the publisher id
							tokenGen.pubPays = true; 
							tokenGen.credits = credits;
						}
						else {
							//publisher client should check if the count via indexing the 
							//CreditPush array for the publisher id and message the 
							//subscriber if allowed to subscribe within the maxCount
							tokenGen.pubPays = true; 
						}
						break;
					case CreditsMode_Dynamic:
						break;
					case CreditsMode_Selected:
						q = query(where("id").is(roomId).andOperator(where("credits.subUserIds").is(usero.id)));
						q.fields().include("id").include("credits");
						tokenGen.pubPays = mongoOperationsP2P.exists(q, Room.class);
						break;
					default:
						break;
					
					}
				}
				
				break;
			}
			
			
			String resJSON = mapper.writeValueAsString(tokenGen);
			
			
			
			//TODO: encrypt the following actually with logintoken
			
			
			
			res.put(resultKeys[1], resJSON);
			res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
			//res.put(resultKeys[1], "OK");
			/*q.fields().include("id").include("refRoomsFW").include("refRoomsKWs").include("refUsersFW").include("refUsersKWs");
			q.fields().include("id").include("refRoomsFW").include("refRoomsKWs").include("refUsersFW").include("refUsersKWs");		
			q.fields().include("refRoomsFW").include("refRoomsKWs").include("refRoomsOneWay");
			*/
			//String thisUser = usero.id;
			//q = query(where("id").is(roomId));
			NotificationService.NotificationArgs arg = new NotificationService.NotificationArgs();
			arg.roomId = roomId;
			arg.stType = streamTypeE;
			arg.userId = usero.id;
			//arg.roomOwnerId = room.userId;
			NotifyMessage msg = new NotifyMessage();
			msg.nickName = usero.nickName;
			msg.imageURL = usero.imageName;
			msg.roomName = room.name;
			msg.roomId = roomId;
			if(room.images != null) {
				Iterator<String> it = room.images.iterator();
				int cnt = 0;
				while(it.hasNext()) {
					if(cnt >= room.MainImageIdx) {
						msg.roomImage = it.next();
						break;
					}
				}
			}
			
			String resMsg = mapper.writeValueAsString(msg);
			notificationImpl.sendNotification(arg, resMsg);
			/*if(streamTypeE == Room.StreamType.StreamType_Publish) {
				mongoOperationsP2P.updateFirst(q, new Update().addToSet("refPubs", usero.id), Room.class);
				String msg = null;
				
				q = query(where("refRoomsFW").is(roomId).orOperator(where("refRoomsKWs").is(roomId)).orOperator(where("refRoomsOneWay").is(roomId)));
				q.fields().include("id").include("notifyRegId");
				List<User> users = mongoOperationsUSER.find(q, User.class);
				for(User u: users) {
					notificationImpl.sendNotification(msg);
				}
				Set<String> userList = new HashSet<String>();
				q = query(where("id").is(room.userId));
				q.fields().include("id").include("refUsersFW").include("refUsersKWs").include("refUsersOneWay");
				usero = mongoOperationsUSER.findOne(q, User.class);
				userList.addAll(usero.refUsersFW);
				userList.addAll(usero.refUsersKWs);
				userList.addAll(usero.refUsersOneWay);
				q = query(where("id").in(room.userId).andOperator(where("id").ne(thisUser)));
				q.fields().include("id").include("notifyRegId");
				users = mongoOperationsUSER.find(q, User.class);
				for(User u: users) {
					notificationImpl.sendNotification(msg);
				}
			}
			else if(streamTypeE == Room.StreamType.StreamType_Subscribe) {
				mongoOperationsP2P.updateFirst(q, new Update().addToSet("refSubs", usero.id), Room.class);
			}*/
			
			// notify the other end i.e. pubs when sub is being added so that they can pull the direct sessions/tokens for this sub
			// and vice versa i.e. for a new pub so that each sub can add the direct sessions/tokens for this pub
			
			return getResult(res);
			
			
			
			
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		} catch (OpenTokException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		}
		return getResult(res);
	}
	
	public String subscribeSession(String adid, String data)
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], null);
		res.put(resultKeys[1], "Invalid");
		
		try {
			Map<String, Object> vals = mapper.readValue(data, Map.class);
			
			//String page = (Integer) vals.get(ApiFields.Page);
			String roomId = (String) vals.get(ApiFields.ModelId);		
			String userId = (String) vals.get(ApiFields.UserId);
			Boolean inBrowse = (Boolean) vals.get(ApiFields.SubscribeBrowse);
			//String sessInstanceId = (String) vals.get(ApiFields.SessionInstance);
			try {
				
				assert (roomId == null)  : "no room";
				//assert (userId == null)  : "no userId";
				
				
				assert adid == null : "no adid";
				assert userId == null : "no userId";
				//assert sessInstanceId == null : "no sessionInstance";
			} catch (AssertionError e) {
				res.put(resultKeys[1], e.getMessage());
				return getResult(res);
			}
	
			SubInfo subInfo = new SubInfo();
			if(inBrowse != true) {
				//These are a temp room for ensuring 1:1 communication between pub/sub
				// Else the sub's publishing activity will not only be visible to the main pub
				// But also other sub's
				subInfo.pubToken = new TokenGen();
				String sessDirect = webRtcInst.createSession();
				String tokenDirect = webRtcInst.createToken(sessDirect, Room.StreamType.StreamType_Publish, null);
				subInfo.pubToken.session = sessDirect;
				subInfo.pubToken.token = tokenDirect;
				
				subInfo.subToken = new TokenGen();
				tokenDirect = webRtcInst.createToken(sessDirect, Room.StreamType.StreamType_Publish, null);
				subInfo.subToken.session = sessDirect;
				subInfo.subToken.token = tokenDirect;
			}
			subInfo.userJSON = this.getUser(adid, data, true);
			String resJSON = mapper.writeValueAsString(subInfo);
			
			//TODO: encrypt the following actually with logintoken

			res.put(resultKeys[1], resJSON);
			res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
			
			//Query q = query(where("id").is(sessInstanceId));
			//mongoOperationsP2P.updateFirst(q, new Update().set("start", new Date()), SessionInstance.class);
			
			return getResult(res);
			
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		} catch (OpenTokException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		}
		catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			res.put(resultKeys[1], "System Error");
		}
		return getResult(res);
	}
	
	public String endSession(String adid, String data)
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], null);
		res.put(resultKeys[1], "Invalid");
		
		try {
			Map<String, Object> vals = mapper.readValue(data, Map.class);
			
			//String page = (Integer) vals.get(ApiFields.Page);
			String roomId = (String) vals.get(ApiFields.ModelId);
			Integer streamType = (Integer) vals.get(ApiFields.StreamType);
			Room.StreamType streamTypeE = Room.StreamType.values()[streamType];
			//String userId = (String) vals.get(ApiFields.UserId);
			String sessInstanceId = (String) vals.get(ApiFields.SessionInstance);
			try {
				
				assert (roomId == null)  : "no room";
				//assert (userId == null)  : "no userId";
				assert (streamType == null)  : "no stream type";
				
				assert adid == null : "no adid";
				//assert userId == null : "no userId";
				//assert sessInstanceId == null : "no sessionInstance";
				
			} catch (AssertionError e) {
				res.put(resultKeys[1], e.getMessage());
				return getResult(res);
			}
			
			Room room = null;
			if(roomId != null) {
				Query q = query(where("id").is(roomId));
				q.fields().include("id");
				room = mongoOperationsP2P.findOne(q, Room.class);
				if( room == null) {
					LOG.info("No such room: " + roomId);
					res.put(resultKeys[1], "No such room:  " + roomId);
					return getResult(res);
				}
			}
			else {
				LOG.info("No room id specified: " + adid);
				res.put(resultKeys[1], "Invalid arguments: " + adid);
				return getResult(res);
				
			} 
			Query q = query(where("adid").is(adid));
			q.fields().include("id");
			User usero = mongoOperationsUSER.findOne(q, User.class);
			if(usero == null) {
				LOG.info("No such user: " + adid);
				
				res.put(resultKeys[1], "No such user: " + adid);
				return getResult(res);
			}
			
			
			if(streamTypeE == Room.StreamType.StreamType_Publish) {
				q = query(where("id").is(roomId));
				mongoOperationsP2P.updateFirst(q, new Update().pull("refPubs", usero.id).inc("refPubsCount", -1).pull("credits.pubUserId", usero.id), Room.class);
			}
			else if(streamTypeE == Room.StreamType.StreamType_Subscribe) {
				Date end = new Date();
				q = query(where("id").is(sessInstanceId));
				mongoOperationsP2P.updateFirst(q, new Update().set("end", end), SessionInstance.class);
				q.fields().include("start");
				SessionInstance inst = mongoOperationsP2P.findOne(q, SessionInstance.class);
				long diff = end.getTime() - inst.start.getTime();
				long diffMinutes = diff / (60 * 1000) % 60;
				if(diffMinutes == 0)
					diffMinutes = 1;//minimum credit resolution is a minute
				q = query(where("id").is(roomId));
				mongoOperationsP2P.updateFirst(q, new Update().pull("refSubs", usero.id), Room.class);
				q = query(where("adid").is(adid));
				mongoOperationsUSER.updateFirst(q, new Update().inc("usersCredits.totalCreditAvailable", -diffMinutes), User.class);
				
				
				//usero.usersCredits.totalCreditAvailable;
			}
			
			
			//TODO: encrypt the following actually with logintoken
			res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
			res.put(resultKeys[1], "OK");
			return getResult(res);
			
			
			
			
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return getResult(res);
	}
	
	public String credits(String adid, String data)
	{
		Map<String, Object> res = new HashMap<String, Object>();
		res.put(resultKeys[0], null);
		res.put(resultKeys[1], "Invalid");
		Integer credits = null;
		try {
			if(data != null) {
				Map<String, Object> vals = mapper.readValue(data, Map.class);
				
				
				credits = (Integer) vals.get(ApiFields.Credits);
				
			}
			
			try {
				
				if(data != null) assert (credits == null)  : "no credits";
				
				
				assert adid == null : "no adid";
				//assert userId == null : "no userId";
				
			} catch (AssertionError e) {
				res.put(resultKeys[1], e.getMessage());
				return getResult(res);
			}
			
			
			Query q = query(where("adid").is(adid));
			q.fields().include("id");
			User usero = mongoOperationsUSER.findOne(q, User.class);
			if(usero == null) {
				LOG.info("No such user: " + adid);
				
				res.put(resultKeys[1], "No such user: " + adid);
				return getResult(res);
			}
			if(data != null)
				mongoOperationsUSER.updateFirst(q, new Update().inc("usersCredits", credits), User.class);
			else {
				q.fields().include("usersCredits");
				usero = mongoOperationsUSER.findOne(q, User.class);
				credits = usero.usersCredits.totalCreditAvailable;
			}
			Map<String, Object> res1 = new HashMap<String, Object>();
			
			//TODO: encrypt the following actually with logintoken
			res1.put(ApiFields.Credits, credits);
			
			
			res.put(resultKeys[1], mapper.writeValueAsString(res1));
			//TODO: encrypt the following actually with logintoken
			res.put(resultKeys[0], ServiceResults.ServiceResults_OK.ordinal());
			
			return getResult(res);
			
			
			
			
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return getResult(res);
	}
	
}
