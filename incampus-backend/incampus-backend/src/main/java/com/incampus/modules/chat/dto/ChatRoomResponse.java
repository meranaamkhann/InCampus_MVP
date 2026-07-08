package com.incampus.modules.chat.dto;

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
public class ChatRoomResponse {
    private UUID id;
    private UserSummaryResponse otherUser;
    private String lastMessagePreview;
    private Instant lastMessageAt;
    private boolean otherUserOnline;
}
