package com.incampus.modules.community;

import com.incampus.common.response.PageResponse;
import com.incampus.modules.community.dto.CommunityResponse;
import com.incampus.modules.community.dto.CreateCommunityRequest;

import java.util.UUID;

public interface CommunityService {
    CommunityResponse create(UUID creatorId, CreateCommunityRequest request);
    CommunityResponse get(UUID communityId, UUID currentUserId);
    PageResponse<CommunityResponse> list(String query, UUID currentUserId, int page, int size);
    void join(UUID communityId, UUID userId);
    void leave(UUID communityId, UUID userId);
}
