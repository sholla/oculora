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
public class TokenGen {
	@JsonProperty(ApiFields.SessionId_OT)
	public String session;
	@JsonProperty(ApiFields.StreamToken)
	public String token;
	@JsonProperty(ApiFields.Credits)
	public CreditsPush credits;
	@JsonProperty(ApiFields.CreditsState)
	public Boolean pubPays;
	@JsonProperty(ApiFields.SessionInstance)
	public String sessionInstance;
}
