package com.incampus.modules.report;

import com.incampus.common.response.ApiResponse;
import com.incampus.modules.report.dto.CreateReportRequest;
import com.incampus.modules.report.dto.ReportResponse;
import com.incampus.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReportResponse> submit(@AuthenticationPrincipal UserPrincipal principal,
                                               @Valid @RequestBody CreateReportRequest request) {
        return ApiResponse.ok(reportService.submit(principal.getId(), request));
    }
}
