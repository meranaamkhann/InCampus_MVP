package com.incampus.modules.chat;

import com.incampus.common.BaseEntity;
import com.incampus.modules.user.User;
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
 * One-to-one chat room. userA/userB ordering is normalized (smaller UUID
 * first) at creation time so we can enforce the unique constraint below and
 * avoid ever creating duplicate rooms for the same pair.
 */
@Entity
@Table(name = "chat_rooms", uniqueConstraints = {
        @UniqueConstraint(name = "uq_chat_participants", columnNames = {"user_a_id", "user_b_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_a_id", nullable = false)
    private User userA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_b_id", nullable = false)
    private User userB;

    private String lastMessagePreview;

    private java.time.Instant lastMessageAt;
}
