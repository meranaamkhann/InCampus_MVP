package com.incampus.modules.chat;

import com.incampus.common.response.PageResponse;
import com.incampus.modules.chat.dto.ChatRoomResponse;
import com.incampus.modules.chat.dto.MessageResponse;
import com.incampus.modules.chat.dto.SendMessageRequest;

import java.util.UUID;

public interface ChatService {
    MessageResponse sendMessage(UUID senderId, SendMessageRequest request);
    PageResponse<MessageResponse> getMessages(UUID roomId, UUID currentUserId, int page, int size);
    PageResponse<ChatRoomResponse> getRooms(UUID currentUserId, int page, int size);
    void markRead(UUID roomId, UUID currentUserId);
    UUID getOrCreateRoomId(UUID userA, UUID userB);
}
