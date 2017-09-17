/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.match;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;



import com.tamatura.revideo.data.model.Room;


/**
 * @author Shreesh
 *
 */
@Document
public class MatcherRoomTarget extends MatchTargetBase{

	@Indexed
	public Room target;
	
}
