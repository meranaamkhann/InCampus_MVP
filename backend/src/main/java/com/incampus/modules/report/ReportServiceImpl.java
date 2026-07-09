package com.incampus.modules.report;

import com.incampus.common.enums.ReportStatus;
import com.incampus.common.exception.ApiException;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.report.dto.CreateReportRequest;
import com.incampus.modules.report.dto.ReportResponse;
import com.incampus.modules.user.User;
import com.incampus.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ReportResponse submit(UUID reporterId, CreateReportRequest request) {
        User reporter = userRepository.findById(reporterId).orElseThrow(() -> ApiException.notFound("User not found"));

        Report report = Report.builder()
                .reporter(reporter)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .status(ReportStatus.PENDING)
                .build();
        reportRepository.save(report);
        return toResponse(report);
    }

    @Override
    public PageResponse<ReportResponse> getByStatus(ReportStatus status, int page, int size) {
        return PageResponse.from(reportRepository.findByStatus(status, PageRequest.of(page, size)).map(this::toResponse));
    }

    @Override
    @Transactional
    public void resolve(UUID reportId, UUID moderatorId, ReportStatus decision, String notes) {
        if (decision != ReportStatus.ACTIONED && decision != ReportStatus.DISMISSED) {
            throw ApiException.badRequest("Resolution must be ACTIONED or DISMISSED");
        }
        Report report = reportRepository.findById(reportId).orElseThrow(() -> ApiException.notFound("Report not found"));
        User moderator = userRepository.findById(moderatorId).orElseThrow(() -> ApiException.notFound("User not found"));

        report.setStatus(decision);
        report.setReviewedBy(moderator);
        report.setResolutionNotes(notes);
        reportRepository.save(report);
        // TODO(Phase 8 - Admin): if ACTIONED, cascade the actual moderation action
        // (soft-delete the target post/comment, warn/ban the target user) based
        // on report.getTargetType(), and fire a NotificationType.REPORT_ACTIONED event.
    }

    private ReportResponse toResponse(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .reporterId(report.getReporter().getId())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reason(report.getReason())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
