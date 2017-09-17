/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.data.model;

import com.tamatura.revideo.service.ApiFields;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author Shreesh
 *
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class RoomJsonDS extends Room {

	/**
	 * 
	 */
	/*public RoomJsonDS() {
		// TODO Auto-generated constructor stub
		if(searchModeDS != null)
			this.searchMode = Room.RoomPairMode.values()[searchModeDS];
	}*/

	@JsonProperty(ApiFields.SearchMode)
	public Integer searchModeDS;
}
