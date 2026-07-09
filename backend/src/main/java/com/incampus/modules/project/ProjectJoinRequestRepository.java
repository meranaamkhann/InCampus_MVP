package com.incampus.modules.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProjectJoinRequestRepository extends JpaRepository<ProjectJoinRequest, UUID> {
    boolean existsByProjectIdAndRequesterId(UUID projectId, UUID requesterId);
    Page<ProjectJoinRequest> findByProjectId(UUID projectId, Pageable pageable);
    Optional<ProjectJoinRequest> findById(UUID id);
}
