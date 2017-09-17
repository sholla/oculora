/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.match;

import org.springframework.data.mongodb.core.index.Indexed;

import com.tamatura.revideo.data.model.RelatedModel.RelatedModelType;

/**
 * @author Shreesh
 *
 */
abstract class MatchTargetBase {
	@Indexed
	public String sourceId;
	@Indexed
	public MatchTargetType targetType;
}
