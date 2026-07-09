package com.incampus.modules.notification;

import com.incampus.common.enums.NotificationType;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.notification.dto.NotificationResponse;

import java.util.UUID;

public interface NotificationService {

    /**
     * Central entry point every other module should call (via TODOs left in
     * Post/Comment/Friend/Event/Project services) once Phase 7 wires this in.
     */
    void notify(UUID recipientId, UUID actorId, NotificationType type, UUID targetId, String message);

    PageResponse<NotificationResponse> getNotifications(UUID userId, int page, int size);

    long getUnreadCount(UUID userId);

    void markAsRead(UUID notificationId, UUID currentUserId);

    void markAllAsRead(UUID userId);
}
