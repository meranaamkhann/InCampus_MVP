package com.incampus.modules.studypartner;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StudyPartnerParticipantRepository extends JpaRepository<StudyPartnerParticipant, UUID> {
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
    long countByPostId(UUID postId);
}
