package com.incampus.modules.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityResponse {
    private UUID id;
    private String name;
    private String description;
    private String bannerUrl;
    private long memberCount;
    private boolean joinedByCurrentUser;
}
