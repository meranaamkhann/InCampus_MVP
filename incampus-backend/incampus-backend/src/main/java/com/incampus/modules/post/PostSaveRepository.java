package com.incampus.modules.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PostSaveRepository extends JpaRepository<PostSave, UUID> {
    Optional<PostSave> findByPostIdAndUserId(UUID postId, UUID userId);
    Page<PostSave> findByUserId(UUID userId, Pageable pageable);
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
}
