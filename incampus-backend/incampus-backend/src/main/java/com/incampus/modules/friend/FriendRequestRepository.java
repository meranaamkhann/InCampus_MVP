package com.incampus.modules.friend;

import com.incampus.common.enums.FriendRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, UUID> {
    Optional<FriendRequest> findBySenderIdAndReceiverId(UUID senderId, UUID receiverId);
    Page<FriendRequest> findByReceiverIdAndStatus(UUID receiverId, FriendRequestStatus status, Pageable pageable);
    Page<FriendRequest> findBySenderIdOrReceiverIdAndStatus(UUID senderId, UUID receiverId, FriendRequestStatus status, Pageable pageable);
    boolean existsBySenderIdAndReceiverIdAndStatus(UUID senderId, UUID receiverId, FriendRequestStatus status);
}
