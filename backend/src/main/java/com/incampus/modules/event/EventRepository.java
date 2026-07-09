package com.incampus.modules.event;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    Page<Event> findByDeletedFalseAndEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate from, Pageable pageable);
    Page<Event> findByOrganizerIdAndDeletedFalse(UUID organizerId, Pageable pageable);
    Page<Event> findByDeletedFalseAndTitleContainingIgnoreCaseOrderByEventDateAsc(String title, Pageable pageable);
}
