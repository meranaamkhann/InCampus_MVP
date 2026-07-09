package com.incampus.modules.user;

import com.incampus.common.BaseEntity;
import com.incampus.common.enums.Role;
import com.incampus.common.enums.VerificationStatus;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true),
        @Index(name = "idx_users_college", columnList = "college")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String college;

    private String branch;

    private Integer year;

    private String bio;

    private String profilePictureUrl;

    @ElementCollection
    @CollectionTable(name = "user_interests", joinColumns = @jakarta.persistence.JoinColumn(name = "user_id"))
    @Column(name = "interest")
    @Builder.Default
    private Set<String> interests = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "user_skills", joinColumns = @jakarta.persistence.JoinColumn(name = "user_id"))
    @Column(name = "skill")
    @Builder.Default
    private Set<String> skills = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "user_badges", joinColumns = @jakarta.persistence.JoinColumn(name = "user_id"))
    @Column(name = "badge")
    @Builder.Default
    private Set<String> badges = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.STUDENT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    // --- OTP verification (college email check) ---
    private String otpCodeHash;
    private Instant otpExpiresAt;

    // --- Refresh token tracking (rotate + revoke on logout) ---
    private String currentRefreshTokenHash;
    private Instant refreshTokenExpiresAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean banned = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;
}
