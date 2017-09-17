/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.data.model;

import java.util.HashSet;
import java.util.Set;

import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.tamatura.revideo.service.ApiFields;
import com.tamatura.revideo.service.match.IMatchRoot;

/**
 * @author Shreesh
 *
 * Class describing state/credentials of a user
 */
@Document
public class User implements IMatchRoot{
	
	@JsonProperty(ApiFields.ModelId)
	@Id
	public String id;
	@JsonProperty(ApiFields.User)
	@Indexed
	public String fullName;
	@JsonProperty(ApiFields.NickName)
	@Indexed(unique = true) 
	public String nickName;
	@JsonProperty(ApiFields.ProfileImage)
	public String imageName;
	//public String pwHash;
	@JsonProperty(ApiFields.AppDeviceID)
	@Indexed
	@JsonIgnore public String adid;
	@JsonProperty(ApiFields.LoginToken)
	@JsonIgnore public String loginToken;
	//supporting Android/gcm only for now
	@JsonIgnore public String notifyRegId;
	@JsonProperty(ApiFields.Keywords)
	public Set<String> keywords; //keywords of user describing themselves
	//@Indexed
	//public String numberHash;
	//public String userCode; //for acceptance from user
	
	//list of user ids that have connected
	
	//	- two way follow logic from below
	@Indexed
	public Set<String> refUsersFW ;
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
/*	
	// Room ids matched on keywords allowing pub-sub
	// - matching on keywords between user's kws and target room's kws: needs to be updated 
	//		on rooms/users being added or user changing their keywords
	@Indexed
	public Set<String> refRoomsKWs = new HashSet<String>();
	// Room ids user has followed but room has not yet followed this user
	// Allows this user to be on subscribe list when room is being published to
	@Indexed
	public Set<String> refRoomsOneWay = new HashSet<String>();
	// Room ids matched based on two way follow between room and user
	// Preferred pub-sub for this user
	@Indexed
	public Set<String> refRoomsFW = new HashSet<String>();
	*/
	//Hence:
	// PUB candidates:
	//	Rooms that are created by any user in: refUsersFW, refUsersKWs
	//  Rooms that are: refRoomsFW, refRoomsKWs
	// SUB candidates:
	//	Rooms that are created by any user in: refUsersFW, refUsersOneWay, refUsersKWs
	//  Rooms that are: refRoomsFW, refRoomsOneWay, refRoomsKWs
	//Room specific choices are preferred to that of user specific choices
	//List here is in order of preference for each user/room specific choice
	
	//does the user have the app
	//public Boolean isInstalled;
	@JsonProperty(ApiFields.Credits)
	public Credit usersCredits = new Credit();
	//Messaging endpoint for this user
	//@JsonProperty(ApiFields.SessionId_OT)
	//public String opentokSessId;
	//@JsonProperty(ApiFields.StreamMessengingToken)
	//public String opentokToken;
	
	

}
