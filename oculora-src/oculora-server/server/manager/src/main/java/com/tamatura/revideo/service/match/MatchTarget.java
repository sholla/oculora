/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.match;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;


/**
 * @author Shreesh
 * This is UGLY! Storage is going to be exponential here! We really need an RDBMS/graphdb here
 * Primarily since "target" has to be embedded - DBRef are a DB driver time resolution
 * not handled by the DB! This means we cannot reach into DbRef's and so have to have an 
 * embedded document to query properly[is the room enabled or not....]
 */
public class MatchTarget {
	@Indexed
	public String sourceId;
	@Indexed
	public MatchTargetType targetType;
	@Indexed
	//@DBRef
	public IMatchRoot target;
}
/*
public class MatchTarget<T> {
@Indexed
public String sourceId;
@Indexed
public MatchTargetType targetType;
@Indexed
@DBRef
public T target;
}
*/