package com.incampus.modules.chat;

import com.incampus.modules.chat.dto.MessageResponse;
import com.incampus.modules.chat.dto.SendMessageRequest;
import com.incampus.modules.chat.dto.TypingEvent;
import com.incampus.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

/**
 * STOMP destinations:
 *   Client sends to   /app/chat.send    -> broadcasts to /topic/chat/{roomId}
 *   Client sends to   /app/chat.typing  -> broadcasts to /topic/chat/{roomId}/typing
 *
 * Auth: the JwtAuthFilter already runs on the initial SockJS handshake
 * request, so @AuthenticationPrincipal resolves the same UserPrincipal used
 * everywhere else in the app - no separate WebSocket auth path to maintain.
 */
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void send(@AuthenticationPrincipal UserPrincipal principal, SendMessageRequest request) {
        presenceService.markOnline(principal.getId());
        MessageResponse saved = chatService.sendMessage(principal.getId(), request);
        messagingTemplate.convertAndSend("/topic/chat/" + saved.getRoomId(), saved);
    }

    @MessageMapping("/chat.typing")
    public void typing(@AuthenticationPrincipal UserPrincipal principal, TypingEvent event) {
        presenceService.markOnline(principal.getId());
        messagingTemplate.convertAndSend("/topic/chat/" + event.getRoomId() + "/typing",
                TypingEvent.builder().roomId(event.getRoomId()).userId(principal.getId()).typing(event.isTyping()).build());
    }

    @MessageMapping("/presence.heartbeat")
    public void heartbeat(@AuthenticationPrincipal UserPrincipal principal) {
        presenceService.markOnline(principal.getId());
    }
}
