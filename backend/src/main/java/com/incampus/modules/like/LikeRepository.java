package com.incampus.modules.like;

import com.incampus.common.enums.ReportTargetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LikeRepository extends JpaRepository<Like, UUID> {
    Optional<Like> findByUserIdAndTargetTypeAndTargetId(UUID userId, ReportTargetType targetType, UUID targetId);
    long countByTargetTypeAndTargetId(ReportTargetType targetType, UUID targetId);
    boolean existsByUserIdAndTargetTypeAndTargetId(UUID userId, ReportTargetType targetType, UUID targetId);
}
