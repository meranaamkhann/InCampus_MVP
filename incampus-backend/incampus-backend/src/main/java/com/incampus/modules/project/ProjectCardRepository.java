package com.incampus.modules.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProjectCardRepository extends JpaRepository<ProjectCard, UUID> {
    Page<ProjectCard> findByDeletedFalseAndOpenTrueOrderByCreatedAtDesc(Pageable pageable);
}
