/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.data.model;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.tamatura.revideo.service.ApiFields;
import com.tamatura.revideo.service.match.IMatchRoot;
import com.tamatura.revideo.service.sort.SortBy;
import com.tamatura.revideo.service.sort.SortSearchMode;


/**
 * @author Shreesh
 *
 * Model for a Room handling the request
 */
@Document
@JsonIgnoreProperties(ignoreUnknown = true)
public class Room implements IMatchRoot {
	
	//how to be searched/search
	//@JsonFormat(shape=JsonFormat.Shape.OBJECT)
	//@JsonDeserialize(using = RoomPairModeTypeDeserializer.class)
	/*public enum RoomPairMode {
		RoomPairMode_ANY,
		RoomPairMode_MATCHING,
		RoomPairMode_THISUSERS,
		
		//RoomPairMode_TAGSONLY
	}*/
	
	/*public class RoomPairModeTypeDeserializer extends JsonDeserializer<RoomPairMode> {
		 
	    @Override
	    public RoomPairMode deserialize(JsonParser jp, DeserializationContext dc) throws IOException, JsonProcessingException {
	 
	    	RoomPairMode type = RoomPairMode.valueOf(jp.getValueAsString());
	        if (type != null) {
	            return type;
	        }
	        throw new JsonMappingException("invalid value for type, must be 'one' or 'two'");
	    }
	 
	}*/
	
	/*public enum RoomSortBy {
		RoomSortBy_Date, //sort by date created/modified
		RoomSortBy_UserNN, //sort by users nickname
		RoomSortBy_Name, //sort by room name
		RoomSortBy_Pub, //sort by directed to these users off publishersNeeded
		RoomSortBy_Credit, //sort by credits to user
		RoomSortBy_ANY //everything!
	}*/
	
	public static final EnumMap<SortBy, String> sortOnMap = new EnumMap<SortBy, String>(SortBy.class);
	static {
		for(SortBy en: SortBy.values()) {
			String en2 = null;
			switch(en) {
			case SortBy_Date:
				en2 = "createTime";
				break;
			case SortBy_UserNN:
				en2 = "userId";
				break;
			case SortBy_Name:
				en2 = "name";
				break;
			/*default:
				en2 = "createTime";*/
			}
			sortOnMap.put(en, en2);
		}
	}
	/*public enum RoomSortOrder {
		RoomSortOrder_ASC,
		RoomSortOrder_DEC
	}*/
	
	//NOT USED : how TAGS are combined with RoomPairMode
	// ANY supports OR only
	// TAGSONLY is not supported since it makes no sense to combine itself with itself
	/*public enum RoomPairCombinationMode {
		RoomPairCombinationMode_ADDITIVE,
		RoomPairCombinationMode_OR
	}*/
	
	public enum StreamType {
		StreamType_Publish ,
		StreamType_Subscribe
	}
	
	@JsonProperty(ApiFields.ModelId)
	@Id
	public String id;
	@JsonProperty(ApiFields.RoomName)
	@Indexed(unique=true) 
	public String name;
	@JsonProperty(ApiFields.Description)
	public String description;
	@JsonProperty(ApiFields.Images)
	public Set<String> images;
	@JsonProperty(ApiFields.MainImageIdx)
	public int MainImageIdx;
	@JsonProperty(ApiFields.Keywords)
	@Indexed
	public Set<String> keywords; //keywords for room/request
	
	//@Indexed
	//public String houseId;
	@JsonProperty(ApiFields.SessionId_OT)
	public String opentokSessId;
	//list of publishers allowed - use with searchMode:RoomPairMode_THISUSERS
	@JsonProperty(ApiFields.Publishers)
	@Indexed
	public Set<String> publishersNeeded;
	
	
	//public
	//Map of allowed publishers and the credit allowed by them
	//use null <value> if the entry for the publisher is needed but no credit from publisher
	//HashMap<String, CreditsPush> pubAuth = new HashMap<String, CreditsPush>();
	/*public class CreditsReln {
		public String userId;//userID of user allowed to pub/sub to this room using credit
							//null to allow for anyone
		//public StreamType streamType;//type of streaming permitted for this credit
		public CreditsPush credit; //the credit allowed to this user
	}*/
	@JsonProperty(ApiFields.Credits)
	@Indexed
	public Set<CreditsPush> credits;
	//public UUID uuid = UUID.randomUUID();
	//@JsonProperty(ApiFields.SearchMode)
	//@JsonFormat(shape=JsonFormat.Shape.OBJECT)
	//@JsonDeserialize(using = RoomPairModeTypeDeserializer.class)
	@JsonIgnore public SortSearchMode searchMode;//bitflag of allowed enums
	//public RoomPairCombinationMode roomPairCombinationMode;
	//@JsonProperty(ApiFields.SearchCombinationMode)
	//public boolean roomPairCombinationMode;
	
	//connect to the the user who created this room
	@JsonProperty(ApiFields.UserId)
	@Indexed
	public String userId;
	@JsonProperty(ApiFields.Enable)
	@Indexed
	public Boolean enabled = false;
	@JsonProperty(ApiFields.Create)
	@JsonIgnore public Boolean create = null;
	@JsonProperty(ApiFields.CreateTime)
	@Indexed
	public Date createTime;
	
	//list of active publishers
	@JsonIgnore public Set<String> refPubs;
	// list of active subs - which HAS to include the room owner/creater
	@JsonIgnore public Set<String> refSubs;
	
	//num entrys in refPub to indicate this room is actively being published to
	// FIXME: Workaroud  for mongodb not being able to query for an array being non-empty
	// in a clean way - at least as much as I could see
	@Indexed
	@JsonIgnore public int refPubsCount = 0;
	
	
	//list of user ids that have connected
	
		//	- two way follow logic from below
		@Indexed
		public Set<String> refUsersFW;
		//	- matching on keywords between users: needs to be updated on users being added
		//		or user changing their keywords
		@Indexed
		public Set<String> refUsersKWs;
		//list of users this user follows but those users have not yet followed this user
		//this user thus come up in the subscriber list when any of the rooms from the user list below is being published to
		//	- on any user from this list following this user, the target user of this list gets upgraded into "refUsersFW"
		//	and is added to that list while being removed from this list
		//@Indexed
		//public Set<String> refUsersOneWay;
		
		// Room ids matched on keywords allowing pub-sub
		// - matching on keywords between user's kws and target room's kws: needs to be updated 
		//		on rooms/users being added or user changing their keywords
		@Indexed
		public Set<String> refRoomsKWs;
		// Room ids user has followed but room has not yet followed this user
		// Allows this user to be on subscribe list when room is being published to
		//@Indexed
		//public Set<String> refRoomsOneWay;
		// Room ids matched based on two way follow between room and user
		// Preferred pub-sub for this user
		@Indexed
		public Set<String> refRoomsFW;
		
		//Hence:
		// PUB candidates:
		//	Rooms that are created by any user in: refUsersFW, refUsersKWs
		//  Rooms that are: refRoomsFW, refRoomsKWs
		// SUB candidates:
		//	Rooms that are created by any user in: refUsersFW, refUsersOneWay, refUsersKWs
		//  Rooms that are: refRoomsFW, refRoomsOneWay, refRoomsKWs
		//Room specific choices are preferred to that of user specific choices
		//List here is in order of preference for each user/room specific choice
	
	
	//Room info for exchange with other publishers/subscribers in the UI
	public class ExtRoom {
		@JsonProperty(ApiFields.ModelId)
		public String id;
		@JsonProperty(ApiFields.RoomName)
		public String name;
		@JsonProperty(ApiFields.Description)
		public String description;
		@JsonProperty(ApiFields.Images)
		public Set<String> images;
		@JsonProperty(ApiFields.MainImageIdx)
		public int MainImageIdx;
		@JsonProperty(ApiFields.Keywords)
		public Set<String> keywords; //keywords for room/request
		
		//@JsonProperty(ApiFields.SessionId_OT)
		//public String opentokSessId;
		@JsonProperty(ApiFields.UserId)
		public String userId;
		@JsonProperty(ApiFields.NickName)
		public String nickName;
		@JsonProperty(ApiFields.Credits)
		public Set<CreditsPush> credits;
		@JsonProperty(ApiFields.Enable)
		public Boolean enabled = false;
		@JsonProperty(ApiFields.SearchMode)
		@JsonFormat(shape=JsonFormat.Shape.NUMBER)
		public SortSearchMode searchMode;
		public boolean follow;
		public ExtRoom(Room rm) {
			id = rm.id;
			name = rm.name;
			id = rm.id;
			description = rm.description;
			images = rm.images;
			MainImageIdx = rm.MainImageIdx;
			keywords = rm.keywords;
			//opentokSessId = rm.opentokSessId;
			userId = rm.userId;
			credits = rm.credits;
			enabled = rm.enabled;
			searchMode = rm.searchMode;
		}
	}
	
	public ExtRoom getExtRoom() {
		ExtRoom room = new ExtRoom(this);
		return room;
	}
	
	
	
	
}
