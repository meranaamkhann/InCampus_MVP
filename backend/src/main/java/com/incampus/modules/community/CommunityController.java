package com.incampus.modules.community;

import com.incampus.common.response.ApiResponse;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.community.dto.CommunityResponse;
import com.incampus.modules.community.dto.CreateCommunityRequest;
import com.incampus.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CommunityResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                  @Valid @RequestBody CreateCommunityRequest request) {
        return ApiResponse.ok(communityService.create(principal.getId(), request));
    }

    @GetMapping
    public ApiResponse<PageResponse<CommunityResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(communityService.list(query, principal.getId(), page, size));
    }

    @GetMapping("/{communityId}")
    public ApiResponse<CommunityResponse> get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID communityId) {
        return ApiResponse.ok(communityService.get(communityId, principal.getId()));
    }

    @PostMapping("/{communityId}/join")
    public ApiResponse<Void> join(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID communityId) {
        communityService.join(communityId, principal.getId());
        return ApiResponse.ok("Joined community", null);
    }

    @DeleteMapping("/{communityId}/leave")
    public ApiResponse<Void> leave(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID communityId) {
        communityService.leave(communityId, principal.getId());
        return ApiResponse.ok("Left community", null);
    }
}
