package com.incampus.modules.event;

import com.incampus.common.enums.EventParticipationStatus;
import com.incampus.common.enums.NotificationType;
import com.incampus.common.exception.ApiException;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.event.dto.CreateEventRequest;
import com.incampus.modules.event.dto.EventResponse;
import com.incampus.modules.notification.NotificationService;
import com.incampus.modules.user.User;
import com.incampus.modules.user.UserRepository;
import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public EventResponse create(UUID organizerId, CreateEventRequest request) {
        User organizer = userRepository.findById(organizerId).orElseThrow(() -> ApiException.notFound("User not found"));

        Event event = Event.builder()
                .organizer(organizer)
                .title(request.getTitle())
                .description(request.getDescription())
                .eventDate(request.getEventDate())
                .eventTime(request.getEventTime())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .maxParticipants(request.getMaxParticipants())
                .category(request.getCategory())
                .bannerUrl(request.getBannerUrl())
                .build();
        eventRepository.save(event);
        return toResponse(event, organizerId);
    }

    @Override
    public EventResponse get(UUID eventId, UUID currentUserId) {
        return toResponse(findOrThrow(eventId), currentUserId);
    }

    @Override
    public PageResponse<EventResponse> getUpcoming(UUID currentUserId, int page, int size) {
        Page<Event> events = eventRepository.findByDeletedFalseAndEventDateGreaterThanEqualOrderByEventDateAsc(
                LocalDate.now(), PageRequest.of(page, size));
        return PageResponse.from(events.map(e -> toResponse(e, currentUserId)));
    }

    @Override
    public PageResponse<EventResponse> search(String query, UUID currentUserId, int page, int size) {
        Page<Event> events = eventRepository.findByDeletedFalseAndTitleContainingIgnoreCaseOrderByEventDateAsc(
                query, PageRequest.of(page, size));
        return PageResponse.from(events.map(e -> toResponse(e, currentUserId)));
    }

    @Override
    @Transactional
    public void join(UUID eventId, UUID userId) {
        Event event = findOrThrow(eventId);
        if (event.getMaxParticipants() != null
                && eventParticipantRepository.countByEventIdAndStatus(eventId, EventParticipationStatus.JOINED) >= event.getMaxParticipants()) {
            throw ApiException.badRequest("This event has reached its participant limit");
        }
        setParticipation(event, userId, EventParticipationStatus.JOINED);
    }

    @Override
    @Transactional
    public void markInterested(UUID eventId, UUID userId) {
        setParticipation(findOrThrow(eventId), userId, EventParticipationStatus.INTERESTED);
    }

    @Override
    @Transactional
    public void leave(UUID eventId, UUID userId) {
        eventParticipantRepository.findByEventIdAndUserId(eventId, userId).ifPresent(eventParticipantRepository::delete);
    }

    private void setParticipation(Event event, UUID userId, EventParticipationStatus status) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));

        EventParticipant participant = eventParticipantRepository.findByEventIdAndUserId(event.getId(), userId)
                .orElse(EventParticipant.builder().event(event).user(user).build());
        participant.setStatus(status);
        eventParticipantRepository.save(participant);

        if (!event.getOrganizer().getId().equals(userId)) {
            String verb = status == EventParticipationStatus.JOINED ? "joined" : "marked interest in";
            notificationService.notify(
                    event.getOrganizer().getId(), userId, NotificationType.EVENT_INVITE, event.getId(),
                    user.getName() + " " + verb + " your event \"" + event.getTitle() + "\"");
        }
    }

    private Event findOrThrow(UUID eventId) {
        return eventRepository.findById(eventId)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> ApiException.notFound("Event not found"));
    }

    private EventResponse toResponse(Event event, UUID currentUserId) {
        String currentStatus = currentUserId == null ? null :
                eventParticipantRepository.findByEventIdAndUserId(event.getId(), currentUserId)
                        .map(p -> p.getStatus().name())
                        .orElse(null);

        return EventResponse.builder()
                .id(event.getId())
                .organizer(UserSummaryResponse.builder()
                        .id(event.getOrganizer().getId())
                        .name(event.getOrganizer().getName())
                        .profilePictureUrl(event.getOrganizer().getProfilePictureUrl())
                        .college(event.getOrganizer().getCollege())
                        .build())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .eventTime(event.getEventTime())
                .location(event.getLocation())
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .maxParticipants(event.getMaxParticipants())
                .category(event.getCategory())
                .bannerUrl(event.getBannerUrl())
                .joinedCount(eventParticipantRepository.countByEventIdAndStatus(event.getId(), EventParticipationStatus.JOINED))
                .interestedCount(eventParticipantRepository.countByEventIdAndStatus(event.getId(), EventParticipationStatus.INTERESTED))
                .currentUserStatus(currentStatus)
                .build();
    }
}
