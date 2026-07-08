package com.incampus.modules.studypartner.dto;

import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyPartnerPostResponse {
    private UUID id;
    private UserSummaryResponse author;
    private String subject;
    private String description;
    private Set<String> tags;
    private boolean open;
    private long participantCount;
}
