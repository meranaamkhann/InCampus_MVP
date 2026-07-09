package com.incampus.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/** Lightweight user shape used inside posts, comments, search results, etc. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {
    private UUID id;
    private String name;
    private String profilePictureUrl;
    private String college;
}
