package com.incampus.modules.friend;

import com.incampus.common.response.PageResponse;
import com.incampus.modules.friend.dto.FriendRequestResponse;
import com.incampus.modules.user.dto.UserSummaryResponse;

import java.util.UUID;

public interface FriendService {
    void sendRequest(UUID senderId, UUID receiverId);
    void acceptRequest(UUID requestId, UUID currentUserId);
    void rejectRequest(UUID requestId, UUID currentUserId);
    void removeFriend(UUID currentUserId, UUID friendUserId);
    PageResponse<FriendRequestResponse> getPendingRequests(UUID userId, int page, int size);
    PageResponse<UserSummaryResponse> getSuggestedFriends(UUID userId, int page, int size);
}
