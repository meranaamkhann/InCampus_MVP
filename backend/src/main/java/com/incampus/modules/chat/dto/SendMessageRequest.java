package com.incampus.modules.chat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SendMessageRequest {
    private UUID roomId; // set by server if null and receiverId provided instead (REST convenience)
    private UUID receiverId;
    @NotBlank
    private String content;
}
