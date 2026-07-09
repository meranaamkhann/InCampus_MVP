package com.incampus.modules.report.dto;

import com.incampus.common.enums.ReportStatus;
import com.incampus.common.enums.ReportTargetType;
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
public class ReportResponse {
    private UUID id;
    private UUID reporterId;
    private ReportTargetType targetType;
    private UUID targetId;
    private String reason;
    private ReportStatus status;
    private Instant createdAt;
}
