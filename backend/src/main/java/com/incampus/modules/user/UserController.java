package com.incampus.modules.user;

import com.incampus.common.response.ApiResponse;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.user.dto.UpdateProfileRequest;
import com.incampus.modules.user.dto.UserProfileResponse;
import com.incampus.modules.user.dto.UserSummaryResponse;
import com.incampus.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(userService.getProfile(principal.getId(), principal.getId()));
    }

    @PutMapping("/me")
    public ApiResponse<UserProfileResponse> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok(userService.updateProfile(principal.getId(), request));
    }

    @GetMapping("/{userId}")
    public ApiResponse<UserProfileResponse> getProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID userId) {
        return ApiResponse.ok(userService.getProfile(userId, principal.getId()));
    }

    @PostMapping("/{userId}/follow")
    public ApiResponse<Void> follow(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID userId) {
        userService.follow(principal.getId(), userId);
        return ApiResponse.ok("Followed", null);
    }

    @DeleteMapping("/{userId}/follow")
    public ApiResponse<Void> unfollow(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID userId) {
        userService.unfollow(principal.getId(), userId);
        return ApiResponse.ok("Unfollowed", null);
    }

    @GetMapping("/{userId}/followers")
    public ApiResponse<PageResponse<UserSummaryResponse>> getFollowers(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(userService.getFollowers(userId, page, size));
    }

    @GetMapping("/{userId}/following")
    public ApiResponse<PageResponse<UserSummaryResponse>> getFollowing(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(userService.getFollowing(userId, page, size));
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<UserSummaryResponse>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(userService.search(query, page, size));
    }

    @GetMapping("/colleges")
    public ApiResponse<java.util.List<String>> searchColleges(@RequestParam String query) {
        return ApiResponse.ok(userService.searchColleges(query));
    }
}
