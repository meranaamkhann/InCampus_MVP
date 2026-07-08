package com.incampus.modules.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CommunityRepository extends JpaRepository<Community, UUID> {
    Optional<Community> findByNameIgnoreCase(String name);
    Page<Community> findByDeletedFalse(Pageable pageable);
    Page<Community> findByNameContainingIgnoreCaseAndDeletedFalse(String query, Pageable pageable);
}
