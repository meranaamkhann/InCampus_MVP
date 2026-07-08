package com.incampus.modules.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingEvent {
    private UUID roomId;
    private UUID userId;
    private boolean typing;
}
