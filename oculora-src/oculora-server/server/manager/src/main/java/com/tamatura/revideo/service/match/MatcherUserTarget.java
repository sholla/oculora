/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.match;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.tamatura.revideo.data.model.RelatedModel.RelatedModelType;
import com.tamatura.revideo.data.model.User;

/**
 * @author Shreesh
 *
 */
@Document
public class MatcherUserTarget extends MatchTargetBase{
	@Indexed
	public User target;
}
