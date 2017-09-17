/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.data.model;

import org.codehaus.jackson.annotate.JsonProperty;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tamatura.revideo.service.ApiFields;

/**
 * @author Shreesh
 *
 */
public class Follows {
	
	@JsonProperty(ApiFields.FOLLOW_TARGET_ID)
	public String targetId;
	//@JsonProperty(ApiFields.LoginToken)
	@JsonIgnore public String sourceId;
	@JsonProperty(ApiFields.FollowType)
	public Integer followType;
	@JsonProperty(ApiFields.Follow)
	public Boolean following;
	
	public class FollowsImpl {
		public String targetId;
		public String sourceId;
		public FollowType followType;
		public Boolean following;
		
		public FollowsImpl(Follows flws) {
			targetId = flws.targetId;
			sourceId = flws.sourceId;
			following = flws.following;
			followType = FollowType.values()[flws.followType];
			
		}
	}
	
	public FollowsImpl getFollowsImpl() {
		return this.new FollowsImpl(this);
	}

}
