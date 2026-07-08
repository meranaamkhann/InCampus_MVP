package com.incampus.modules.friend;

import com.incampus.common.response.ApiResponse;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.friend.dto.FriendRequestResponse;
import com.incampus.modules.user.dto.UserSummaryResponse;
import com.incampus.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @PostMapping("/requests/{receiverId}")
    public ApiResponse<Void> sendRequest(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID receiverId) {
        friendService.sendRequest(principal.getId(), receiverId);
        return ApiResponse.ok("Friend request sent", null);
    }

    @PostMapping("/requests/{requestId}/accept")
    public ApiResponse<Void> accept(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID requestId) {
        friendService.acceptRequest(requestId, principal.getId());
        return ApiResponse.ok("Friend request accepted", null);
    }

    @PostMapping("/requests/{requestId}/reject")
    public ApiResponse<Void> reject(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID requestId) {
        friendService.rejectRequest(requestId, principal.getId());
        return ApiResponse.ok("Friend request rejected", null);
    }

    @DeleteMapping("/{friendUserId}")
    public ApiResponse<Void> remove(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID friendUserId) {
        friendService.removeFriend(principal.getId(), friendUserId);
        return ApiResponse.ok("Friend removed", null);
    }

    @GetMapping("/requests/pending")
    public ApiResponse<PageResponse<FriendRequestResponse>> pending(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(friendService.getPendingRequests(principal.getId(), page, size));
    }

    @GetMapping("/suggested")
    public ApiResponse<PageResponse<UserSummaryResponse>> suggested(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(friendService.getSuggestedFriends(principal.getId(), page, size));
    }
}
