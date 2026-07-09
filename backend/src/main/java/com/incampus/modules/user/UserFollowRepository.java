package com.incampus.modules.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserFollowRepository extends JpaRepository<UserFollow, UUID> {

    Optional<UserFollow> findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    Page<UserFollow> findByFollowingId(UUID followingId, Pageable pageable); // followers of a user

    Page<UserFollow> findByFollowerId(UUID followerId, Pageable pageable); // who this user follows

    long countByFollowingId(UUID followingId);

    long countByFollowerId(UUID followerId);

    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
}
