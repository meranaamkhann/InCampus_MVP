package com.incampus.modules.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CommunityMemberRepository extends JpaRepository<CommunityMember, UUID> {
    Optional<CommunityMember> findByCommunityIdAndUserId(UUID communityId, UUID userId);
    Page<CommunityMember> findByCommunityId(UUID communityId, Pageable pageable);
    Page<CommunityMember> findByUserId(UUID userId, Pageable pageable);
    boolean existsByCommunityIdAndUserId(UUID communityId, UUID userId);
}
