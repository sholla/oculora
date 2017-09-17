/*
 * Copyright 2015 Tamaturra Inc.
 */
 
package com.tamatura.revideo.data.model;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.tamatura.revideo.data.model.Room.StreamType;

/**
 * @author Shreesh
 * Used to describe session state
 */

public class SessionInstance {
	@Id
	public String id;
	
	public Date start;
	public Date end;
	@Indexed
	public String userId;
	@Indexed
	public String roomId;
	@Indexed
	public StreamType streamType;
	
}
