package com.incampus.modules.chat;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    Page<Message> findByRoomIdOrderByCreatedAtDesc(UUID roomId, Pageable pageable);
    List<Message> findByRoomIdAndSenderIdNotAndReadAtIsNull(UUID roomId, UUID currentUserId);
}
