package com.incampus.modules.friend.dto;

import com.incampus.common.enums.FriendRequestStatus;
import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestResponse {
    private UUID id;
    private UserSummaryResponse sender;
    private UserSummaryResponse receiver;
    private FriendRequestStatus status;
    private Instant createdAt;
}
