package com.incampus.modules.user.dto;

import com.incampus.common.enums.Role;
import com.incampus.common.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private UUID id;
    private String name;
    private String email;
    private String college;
    private String branch;
    private Integer year;
    private String bio;
    private String profilePictureUrl;
    private Set<String> interests;
    private Set<String> skills;
    private Set<String> badges;
    private Role role;
    private VerificationStatus verificationStatus;
    private long followersCount;
    private long followingCount;
    private boolean banned;
}
