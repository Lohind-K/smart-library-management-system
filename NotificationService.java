package com.smartlibrary.service;

import com.smartlibrary.entity.Notification;
import com.smartlibrary.entity.User;
import com.smartlibrary.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    Notification sendNotification(User user, String title, String message, NotificationType type);
    List<Notification> getUserNotifications(Long userId);
    long getUnreadCount(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}
