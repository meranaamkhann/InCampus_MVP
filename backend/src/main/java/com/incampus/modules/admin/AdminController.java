package com.incampus.modules.admin;

import com.incampus.common.enums.ReportStatus;
import com.incampus.common.response.ApiResponse;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.admin.dto.AdminAnalyticsResponse;
import com.incampus.modules.report.ReportService;
import com.incampus.modules.report.dto.ReportResponse;
import com.incampus.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Everything here is already gated by SecurityConfig
 * (`/api/admin/**` -> hasAnyRole("ADMIN", "MODERATOR")), so no extra
 * per-method @PreAuthorize is needed unless an endpoint needs to be
 * ADMIN-only specifically (e.g. banning - moderators probably shouldn't).
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ReportService reportService;

    @PostMapping("/users/{userId}/ban")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> banUser(@PathVariable UUID userId) {
        adminService.banUser(userId);
        return ApiResponse.ok("User banned", null);
    }

    @PostMapping("/users/{userId}/unban")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> unbanUser(@PathVariable UUID userId) {
        adminService.unbanUser(userId);
        return ApiResponse.ok("User unbanned", null);
    }

    @DeleteMapping("/posts/{postId}")
    public ApiResponse<Void> removePost(@PathVariable UUID postId) {
        adminService.removePost(postId);
        return ApiResponse.ok("Post removed", null);
    }

    @GetMapping("/reports")
    public ApiResponse<PageResponse<ReportResponse>> pendingReports(
            @RequestParam(defaultValue = "PENDING") ReportStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(reportService.getByStatus(status, page, size));
    }

    @PostMapping("/reports/{reportId}/resolve")
    public ApiResponse<Void> resolveReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID reportId,
            @RequestParam ReportStatus decision,
            @RequestParam(required = false) String notes) {
        reportService.resolve(reportId, principal.getId(), decision, notes);
        return ApiResponse.ok("Report resolved", null);
    }

    @GetMapping("/analytics")
    public ApiResponse<AdminAnalyticsResponse> analytics() {
        return ApiResponse.ok(adminService.getAnalytics());
    }
}
