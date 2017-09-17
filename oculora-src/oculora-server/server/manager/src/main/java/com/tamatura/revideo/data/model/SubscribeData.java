/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.data.model;

import org.codehaus.jackson.annotate.JsonProperty;

import com.tamatura.revideo.service.ApiFields;

/**
 * @author Shreesh
 *
 */
public class SubscribeData {
	@JsonProperty(ApiFields.UserId)
	public String uid;
	@JsonProperty(ApiFields.NickName)
	public String nickName;
	@JsonProperty(ApiFields.ProfileImage)
	public String imageName;
	@JsonProperty(ApiFields.Fullview)
	public Boolean fullview;
}
