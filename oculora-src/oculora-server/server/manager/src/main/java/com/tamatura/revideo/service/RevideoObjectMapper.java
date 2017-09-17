/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service;

import javax.annotation.PostConstruct;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;





/**
 * @author Shreesh
 *
 */
public class RevideoObjectMapper extends ObjectMapper{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@PostConstruct
    public void customConfiguration() {
		
        // Uses Enum.toString() for serialization of an Enum
        //this.enable(SerializationFeature.WRITE_ENUMS_USING_INDEX);
        // Uses Enum.toString() for deserialization of an Enum
        //this.enable(SerializationConfig.Feature.);
    }
}
