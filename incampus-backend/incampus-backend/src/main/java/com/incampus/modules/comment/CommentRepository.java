package com.incampus.modules.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    Page<Comment> findByPostIdAndParentCommentIsNullAndDeletedFalseOrderByCreatedAtAsc(UUID postId, Pageable pageable);
    Page<Comment> findByParentCommentIdAndDeletedFalseOrderByCreatedAtAsc(UUID parentCommentId, Pageable pageable);
    long countByPostIdAndDeletedFalse(UUID postId);
}
