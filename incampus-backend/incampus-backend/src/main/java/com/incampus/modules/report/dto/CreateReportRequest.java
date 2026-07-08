package com.incampus.modules.report.dto;

import com.incampus.common.enums.ReportTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateReportRequest {
    @NotNull
    private ReportTargetType targetType;
    @NotNull
    private UUID targetId;
    @NotBlank
    private String reason;
}
