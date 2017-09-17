/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.data.model;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * @author Shreesh
 *
 */
@Document
public class RelatedModel {

	public enum RelatedModelType {
		RelatedModelType_RefUserOneWay,
		RelatedModelType_RefUserFW,
		RelatedModelType_RefUserKWs,
		
		RelatedModelType_RefRoomOneWay,
		RelatedModelType_RefRoomFW,
		RelatedModelType_RefRoomKWs
	}
	
	@Indexed
	public String sourceId;
	@Indexed
	public String targetId;
	@Indexed
	public RelatedModelType modelType;
}

//This is still not good enough - the model is really more relational and we should use
// a RDBMS really to catch these intersections effeciently! Or aggregations.