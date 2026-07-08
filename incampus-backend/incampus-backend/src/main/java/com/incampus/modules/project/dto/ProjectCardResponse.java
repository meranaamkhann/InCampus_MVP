package com.incampus.modules.project.dto;

import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCardResponse {
    private UUID id;
    private UserSummaryResponse author;
    private String title;
    private String description;
    private List<String> rolesNeeded;
    private boolean open;
}
