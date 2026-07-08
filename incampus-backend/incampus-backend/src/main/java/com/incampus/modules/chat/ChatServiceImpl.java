package com.incampus.modules.chat;

import com.incampus.common.exception.ApiException;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.chat.dto.ChatRoomResponse;
import com.incampus.modules.chat.dto.MessageResponse;
import com.incampus.modules.chat.dto.SendMessageRequest;
import com.incampus.modules.user.User;
import com.incampus.modules.user.UserRepository;
import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final PresenceService presenceService;

    @Override
    @Transactional
    public MessageResponse sendMessage(UUID senderId, SendMessageRequest request) {
        UUID roomId = request.getRoomId();
        if (roomId == null) {
            if (request.getReceiverId() == null) {
                throw ApiException.badRequest("Either roomId or receiverId is required");
            }
            roomId = getOrCreateRoomId(senderId, request.getReceiverId());
        }

        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> ApiException.notFound("Chat room not found"));
        User sender = userRepository.findById(senderId).orElseThrow(() -> ApiException.notFound("User not found"));

        assertParticipant(room, senderId);

        Message message = Message.builder().room(room).sender(sender).content(request.getContent()).build();
        messageRepository.save(message);

        room.setLastMessagePreview(request.getContent().length() > 100
                ? request.getContent().substring(0, 100) : request.getContent());
        room.setLastMessageAt(Instant.now());
        chatRoomRepository.save(room);
        // TODO(Phase 6 - Realtime Chat wiring): broadcast this message over
        // /topic/chat/{roomId} via SimpMessagingTemplate from the WebSocket layer,
        // and push a NotificationType.MESSAGE event to the recipient.

        return toResponse(message);
    }

    @Override
    public PageResponse<MessageResponse> getMessages(UUID roomId, UUID currentUserId, int page, int size) {
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> ApiException.notFound("Chat room not found"));
        assertParticipant(room, currentUserId);

        Page<Message> messages = messageRepository.findByRoomIdOrderByCreatedAtDesc(roomId, PageRequest.of(page, size));
        return PageResponse.from(messages.map(this::toResponse));
    }

    @Override
    public PageResponse<ChatRoomResponse> getRooms(UUID currentUserId, int page, int size) {
        Page<ChatRoom> rooms = chatRoomRepository.findRoomsForUser(currentUserId, PageRequest.of(page, size));
        return PageResponse.from(rooms.map(room -> {
            User other = room.getUserA().getId().equals(currentUserId) ? room.getUserB() : room.getUserA();
            return ChatRoomResponse.builder()
                    .id(room.getId())
                    .otherUser(UserSummaryResponse.builder()
                            .id(other.getId())
                            .name(other.getName())
                            .profilePictureUrl(other.getProfilePictureUrl())
                            .college(other.getCollege())
                            .build())
                    .lastMessagePreview(room.getLastMessagePreview())
                    .lastMessageAt(room.getLastMessageAt())
                    .otherUserOnline(presenceService.isOnline(other.getId()))
                    .build();
        }));
    }

    @Override
    @Transactional
    public void markRead(UUID roomId, UUID currentUserId) {
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> ApiException.notFound("Chat room not found"));
        assertParticipant(room, currentUserId);

        var unread = messageRepository.findByRoomIdAndSenderIdNotAndReadAtIsNull(roomId, currentUserId);
        Instant now = Instant.now();
        unread.forEach(m -> m.setReadAt(now));
        messageRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public UUID getOrCreateRoomId(UUID userAId, UUID userBId) {
        // Normalize ordering so (A,B) and (B,A) always map to the same room.
        UUID first = userAId.compareTo(userBId) < 0 ? userAId : userBId;
        UUID second = userAId.compareTo(userBId) < 0 ? userBId : userAId;

        return chatRoomRepository.findByUserAIdAndUserBId(first, second)
                .map(ChatRoom::getId)
                .orElseGet(() -> {
                    User a = userRepository.findById(first).orElseThrow(() -> ApiException.notFound("User not found"));
                    User b = userRepository.findById(second).orElseThrow(() -> ApiException.notFound("User not found"));
                    ChatRoom room = chatRoomRepository.save(ChatRoom.builder().userA(a).userB(b).build());
                    return room.getId();
                });
    }

    private void assertParticipant(ChatRoom room, UUID userId) {
        if (!room.getUserA().getId().equals(userId) && !room.getUserB().getId().equals(userId)) {
            throw ApiException.forbidden("You're not a participant in this chat");
        }
    }

    private MessageResponse toResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .roomId(message.getRoom().getId())
                .senderId(message.getSender().getId())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .readAt(message.getReadAt())
                .build();
    }
}
