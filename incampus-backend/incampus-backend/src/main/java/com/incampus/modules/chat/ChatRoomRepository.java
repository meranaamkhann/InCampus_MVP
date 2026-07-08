package com.incampus.modules.chat;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {

    Optional<ChatRoom> findByUserAIdAndUserBId(UUID userAId, UUID userBId);

    @Query("SELECT r FROM ChatRoom r WHERE r.userA.id = :userId OR r.userB.id = :userId ORDER BY r.lastMessageAt DESC NULLS LAST")
    Page<ChatRoom> findRoomsForUser(@Param("userId") UUID userId, Pageable pageable);
}
