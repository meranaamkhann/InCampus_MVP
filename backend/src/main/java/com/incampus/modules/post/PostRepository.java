package com.incampus.modules.post;

import com.incampus.common.enums.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {

    Page<Post> findByDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByAuthorIdAndDeletedFalseOrderByCreatedAtDesc(UUID authorId, Pageable pageable);

    Page<Post> findByTypeAndDeletedFalseOrderByCreatedAtDesc(PostType type, Pageable pageable);

    // Campus-only feed: posts from users at the same college.
    Page<Post> findByAuthor_CollegeAndDeletedFalseOrderByCreatedAtDesc(String college, Pageable pageable);
}
