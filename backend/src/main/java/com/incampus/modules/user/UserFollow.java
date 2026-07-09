package com.incampus.modules.user;

import com.incampus.common.BaseEntity;
import jakarta.persistence.Entity;
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

/**
 * Directed follow edge: follower -> following.
 * Kept as its own entity (rather than a raw join table) so we can query
 * "who follows me" / "who do I follow" and paginate both directions cheaply.
 */
@Entity
@Table(name = "user_follows", uniqueConstraints = {
        @UniqueConstraint(name = "uq_follower_following", columnNames = {"follower_id", "following_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFollow extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "following_id", nullable = false)
    private User following;
}
