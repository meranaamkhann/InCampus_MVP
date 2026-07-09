package com.incampus.modules.like;

import com.incampus.common.BaseEntity;
import com.incampus.common.enums.ReportTargetType;
import com.incampus.modules.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Generic like, reusable for Posts and Comments (targetType + targetId)
 * instead of duplicating a near-identical table per likeable entity.
 */
@Entity
@Table(name = "likes", uniqueConstraints = {
        @UniqueConstraint(name = "uq_like_user_target", columnNames = {"user_id", "target_type", "target_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Like extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private ReportTargetType targetType; // reuses POST / COMMENT values

    @Column(name = "target_id", nullable = false)
    private UUID targetId;
}
