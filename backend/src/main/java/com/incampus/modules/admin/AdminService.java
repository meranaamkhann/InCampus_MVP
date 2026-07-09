package com.incampus.modules.admin;

import com.incampus.modules.admin.dto.AdminAnalyticsResponse;

import java.util.UUID;

public interface AdminService {
    void banUser(UUID userId);
    void unbanUser(UUID userId);
    void removePost(UUID postId);
    AdminAnalyticsResponse getAnalytics();
}
