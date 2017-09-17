/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.data.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * @author Shreesh
 *
 * Model for a House which owns multiple Rooms
 */
@Document
public class House {
	@Id
	public String id;
	@Indexed
	public String name;
	public String description;
	@Indexed
	public String userId;

}
