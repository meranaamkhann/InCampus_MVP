package com.incampus.modules.project;

import com.incampus.common.enums.ProjectJoinStatus;
import com.incampus.common.response.ApiResponse;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.project.dto.CreateProjectCardRequest;
import com.incampus.modules.project.dto.JoinProjectRequest;
import com.incampus.modules.project.dto.ProjectCardResponse;
import com.incampus.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProjectCardResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                    @Valid @RequestBody CreateProjectCardRequest request) {
        return ApiResponse.ok(projectService.create(principal.getId(), request));
    }

    @GetMapping
    public ApiResponse<PageResponse<ProjectCardResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(projectService.listOpen(page, size));
    }

    @PostMapping("/{projectId}/join-requests")
    public ApiResponse<Void> requestToJoin(@AuthenticationPrincipal UserPrincipal principal,
                                            @PathVariable UUID projectId,
                                            @RequestBody(required = false) JoinProjectRequest request) {
        projectService.requestToJoin(projectId, principal.getId(), request != null ? request : new JoinProjectRequest());
        return ApiResponse.ok("Join request sent", null);
    }

    @PostMapping("/join-requests/{joinRequestId}/accept")
    public ApiResponse<Void> accept(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID joinRequestId) {
        projectService.respondToRequest(joinRequestId, principal.getId(), ProjectJoinStatus.ACCEPTED);
        return ApiResponse.ok("Request accepted", null);
    }

    @PostMapping("/join-requests/{joinRequestId}/reject")
    public ApiResponse<Void> reject(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID joinRequestId) {
        projectService.respondToRequest(joinRequestId, principal.getId(), ProjectJoinStatus.REJECTED);
        return ApiResponse.ok("Request rejected", null);
    }
}
