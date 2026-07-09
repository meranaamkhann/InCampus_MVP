package com.incampus.modules.chat;

import com.incampus.common.response.ApiResponse;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.chat.dto.ChatRoomResponse;
import com.incampus.modules.chat.dto.MessageResponse;
import com.incampus.modules.chat.dto.SendMessageRequest;
import com.incampus.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST endpoints for chat history/room list. Live delivery happens over the
 * STOMP endpoint in ChatWebSocketController - this controller is for
 * initial page loads, pagination, and clients that aren't connected yet.
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/messages")
    public ApiResponse<MessageResponse> send(@AuthenticationPrincipal UserPrincipal principal,
                                              @Valid @RequestBody SendMessageRequest request) {
        return ApiResponse.ok(chatService.sendMessage(principal.getId(), request));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ApiResponse<PageResponse<MessageResponse>> messages(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        return ApiResponse.ok(chatService.getMessages(roomId, principal.getId(), page, size));
    }

    @GetMapping("/rooms")
    public ApiResponse<PageResponse<ChatRoomResponse>> rooms(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(chatService.getRooms(principal.getId(), page, size));
    }

    @PostMapping("/rooms/{roomId}/read")
    public ApiResponse<Void> markRead(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID roomId) {
        chatService.markRead(roomId, principal.getId());
        return ApiResponse.ok(null);
    }

    @GetMapping("/rooms/with/{otherUserId}")
    public ApiResponse<UUID> getOrCreateRoom(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID otherUserId) {
        return ApiResponse.ok(chatService.getOrCreateRoomId(principal.getId(), otherUserId));
    }
}
