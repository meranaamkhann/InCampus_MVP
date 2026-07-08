package com.incampus.modules.event;

import com.incampus.common.response.PageResponse;
import com.incampus.modules.event.dto.CreateEventRequest;
import com.incampus.modules.event.dto.EventResponse;

import java.util.UUID;

public interface EventService {
    EventResponse create(UUID organizerId, CreateEventRequest request);
    EventResponse get(UUID eventId, UUID currentUserId);
    PageResponse<EventResponse> getUpcoming(UUID currentUserId, int page, int size);
    void join(UUID eventId, UUID userId);
    void markInterested(UUID eventId, UUID userId);
    void leave(UUID eventId, UUID userId);
}
