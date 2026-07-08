package com.incampus.modules.user;

import com.incampus.common.response.PageResponse;
import com.incampus.modules.user.dto.UpdateProfileRequest;
import com.incampus.modules.user.dto.UserProfileResponse;
import com.incampus.modules.user.dto.UserSummaryResponse;

import java.util.UUID;

public interface UserService {

    UserProfileResponse getProfile(UUID userId);

    UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request);

    void follow(UUID currentUserId, UUID targetUserId);

    void unfollow(UUID currentUserId, UUID targetUserId);

    PageResponse<UserSummaryResponse> getFollowers(UUID userId, int page, int size);

    PageResponse<UserSummaryResponse> getFollowing(UUID userId, int page, int size);

    PageResponse<UserSummaryResponse> search(String query, int page, int size);
}
