/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.notification;

import java.util.Set;

/**
 * @author Shreesh
 *
 */
public interface INotifyPlatform {
	public void sendNotification(Set<String> regIds, String msg);
}
