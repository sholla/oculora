/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.notification;

import org.codehaus.jackson.annotate.JsonProperty;

import com.tamatura.revideo.service.ApiFields;

/**
 * @author Shreesh
 *
 */
public class NotifyMessage {
	 
	@JsonProperty(ApiFields.NickName)
	public String nickName;
	@JsonProperty(ApiFields.ProfileImage)
	public String imageURL;
	@JsonProperty(ApiFields.RoomName)
	public String roomName;
	@JsonProperty(ApiFields.RoomImage)
	public String roomImage;
	@JsonProperty(ApiFields.ModelId)
	public String roomId;
}
