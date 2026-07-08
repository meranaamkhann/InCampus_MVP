package com.incampus.modules.notification.dto;

import com.incampus.common.enums.NotificationType;
import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private UserSummaryResponse actor;
    private NotificationType type;
    private UUID targetId;
    private String message;
    private boolean read;
    private Instant createdAt;
}
