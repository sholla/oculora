/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.sort;

public enum SortBy {
	SortBy_Date, //sort by date created/modified
	SortBy_UserNN, //sort by users nickname
	SortBy_Name, //sort by room name
	SortBy_Pub, //sort by directed to these users off publishersNeeded
	SortBy_Credit, //sort by credits to user
	//SortBy_ANY //everything!
}
