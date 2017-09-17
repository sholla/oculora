/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.match.impl;

import com.tamatura.revideo.data.model.User;
import com.tamatura.revideo.service.match.IMatchRoot;

/**
 * @author Shreesh
 *
 */
public class MatchUser {
	private User obj;
	
	public MatchUser(IMatchRoot obj) {
		this.obj = (User) obj;
	}
}
