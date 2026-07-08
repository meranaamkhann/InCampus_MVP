package com.incampus.modules.event;

import com.incampus.common.response.ApiResponse;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.event.dto.CreateEventRequest;
import com.incampus.modules.event.dto.EventResponse;
import com.incampus.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EventResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                              @Valid @RequestBody CreateEventRequest request) {
        return ApiResponse.ok(eventService.create(principal.getId(), request));
    }

    @GetMapping("/upcoming")
    public ApiResponse<PageResponse<EventResponse>> upcoming(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(eventService.getUpcoming(principal.getId(), page, size));
    }

    @GetMapping("/{eventId}")
    public ApiResponse<EventResponse> get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID eventId) {
        return ApiResponse.ok(eventService.get(eventId, principal.getId()));
    }

    @PostMapping("/{eventId}/join")
    public ApiResponse<Void> join(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID eventId) {
        eventService.join(eventId, principal.getId());
        return ApiResponse.ok("Joined event", null);
    }

    @PostMapping("/{eventId}/interested")
    public ApiResponse<Void> interested(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID eventId) {
        eventService.markInterested(eventId, principal.getId());
        return ApiResponse.ok("Marked as interested", null);
    }

    @DeleteMapping("/{eventId}/leave")
    public ApiResponse<Void> leave(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID eventId) {
        eventService.leave(eventId, principal.getId());
        return ApiResponse.ok("Left event", null);
    }
}
