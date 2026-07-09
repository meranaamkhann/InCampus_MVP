package com.incampus.modules.studypartner;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StudyPartnerPostRepository extends JpaRepository<StudyPartnerPost, UUID> {
    Page<StudyPartnerPost> findByDeletedFalseAndOpenTrueOrderByCreatedAtDesc(Pageable pageable);
    Page<StudyPartnerPost> findByAuthorIdAndDeletedFalse(UUID authorId, Pageable pageable);
}
