/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.data.model;

import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * @author Shreesh
 * Used to describe state and direction of Opentok tokens
 */
@Document
public class P2PToken {
	@Id
	public String id;
	@Indexed
	public String token;
	@Indexed
	public P2PEnumTypes typeOfAccess;
	//Opentok metadata
	public String description;
	//where is this token being used
	@Indexed
	public String roomId;
	//who is using this
	@Indexed
	public String userId;
	// Target rooms being used
	//@Indexed
	//public List<String> target;
	public Date expiry;
}
