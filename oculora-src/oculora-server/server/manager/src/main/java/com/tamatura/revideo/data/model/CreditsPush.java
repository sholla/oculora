/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.data.model;

import java.util.Set;

import org.springframework.data.mongodb.core.index.Indexed;

/**
 * @author Shreesh
 * Normally streams are paid by subscriber
 *
 */
public class CreditsPush {
	@Indexed
	public Set<String> subUserIds;//userIDs of users getting free subscription!
	@Indexed
	public String pubUserId; //userID of publisher providing this credit
	public int paidByPub = 100; // percentage paid by publisher
	public int maxAllowed = -1; // maximum users allowed this credit
								// -1 indicates no limit i.e. any number of users!
	public enum CreditsMode {
		CreditsMode_ANY, //anyone allowed the credit
		CreditsMode_Selected, //preselected set of users allowed the credit
		CreditsMode_Dynamic //publisher will select users to provide credit on the fly
	}
	@Indexed
	public CreditsMode creditMode;
}
