/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.data.model;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * @author Shreesh
 * Used to describe history of purchasing
 */
@Document
public class Purchase {
	@Id
	public String id;
	public Date purchasedDate;
	public float amount;
	public String purchasePayload;
	//link to whose purchase
	@Indexed
	public String userId;
}
