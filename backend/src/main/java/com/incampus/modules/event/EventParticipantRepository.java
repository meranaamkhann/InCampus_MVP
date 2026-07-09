package com.incampus.modules.event;

import com.incampus.common.enums.EventParticipationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, UUID> {
    Optional<EventParticipant> findByEventIdAndUserId(UUID eventId, UUID userId);
    Page<EventParticipant> findByEventIdAndStatus(UUID eventId, EventParticipationStatus status, Pageable pageable);
    long countByEventIdAndStatus(UUID eventId, EventParticipationStatus status);
}
