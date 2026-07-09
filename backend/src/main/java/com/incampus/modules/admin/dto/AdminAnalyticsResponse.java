package com.incampus.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {
    private long totalUsers;
    private long verifiedUsers;
    private long bannedUsers;
    private long totalPosts;
    private long totalCommunities;
    private long totalEvents;
    private long pendingReports;
}
