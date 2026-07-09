package com.incampus.modules.notification;

import com.incampus.common.enums.NotificationType;
import com.incampus.common.exception.ApiException;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.notification.dto.NotificationResponse;
import com.incampus.modules.user.User;
import com.incampus.modules.user.UserRepository;
import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void notify(UUID recipientId, UUID actorId, NotificationType type, UUID targetId, String message) {
        User recipient = userRepository.findById(recipientId).orElseThrow(() -> ApiException.notFound("User not found"));
        User actor = actorId != null ? userRepository.findById(actorId).orElse(null) : null;

        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .targetId(targetId)
                .message(message)
                .build();
        notificationRepository.save(notification);

        // Push over the user-specific STOMP queue: client subscribes to /user/queue/notifications
        messagingTemplate.convertAndSendToUser(recipient.getEmail(), "/queue/notifications", toResponse(notification));
    }

    @Override
    public PageResponse<NotificationResponse> getNotifications(UUID userId, int page, int size) {
        var notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
        return PageResponse.from(notifications.map(this::toResponse));
    }

    @Override
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId, UUID currentUserId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        if (!notification.getRecipient().getId().equals(currentUserId)) {
            throw ApiException.forbidden("Not your notification");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        var unread = notificationRepository.findByRecipientIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .actor(notification.getActor() != null ? UserSummaryResponse.builder()
                        .id(notification.getActor().getId())
                        .name(notification.getActor().getName())
                        .profilePictureUrl(notification.getActor().getProfilePictureUrl())
                        .college(notification.getActor().getCollege())
                        .build() : null)
                .type(notification.getType())
                .targetId(notification.getTargetId())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
