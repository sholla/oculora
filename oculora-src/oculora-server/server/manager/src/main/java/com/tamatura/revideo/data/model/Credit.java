/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.data.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * @author Shreesh
 * Used to describe state of credits
 */

public class Credit {
	//@Id
	//public String id;
	//@Indexed
	public Integer totalCreditAvailable = 100;
	
}
