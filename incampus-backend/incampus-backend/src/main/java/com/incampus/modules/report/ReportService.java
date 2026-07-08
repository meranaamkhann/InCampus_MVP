package com.incampus.modules.report;

import com.incampus.common.enums.ReportStatus;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.report.dto.CreateReportRequest;
import com.incampus.modules.report.dto.ReportResponse;

import java.util.UUID;

public interface ReportService {
    ReportResponse submit(UUID reporterId, CreateReportRequest request);
    PageResponse<ReportResponse> getByStatus(ReportStatus status, int page, int size);
    void resolve(UUID reportId, UUID moderatorId, ReportStatus decision, String notes);
}
