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
public class SubInfo {
	@JsonProperty(ApiFields.RoomAccessPub)
	public TokenGen pubToken;
	@JsonProperty(ApiFields.RoomAccessSub)
	public TokenGen subToken;
	@JsonProperty(ApiFields.SubInfo)
	public String userJSON;
}
