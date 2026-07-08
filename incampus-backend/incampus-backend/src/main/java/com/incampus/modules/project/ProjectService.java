package com.incampus.modules.project;

import com.incampus.common.enums.ProjectJoinStatus;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.project.dto.CreateProjectCardRequest;
import com.incampus.modules.project.dto.JoinProjectRequest;
import com.incampus.modules.project.dto.ProjectCardResponse;

import java.util.UUID;

public interface ProjectService {
    ProjectCardResponse create(UUID authorId, CreateProjectCardRequest request);
    PageResponse<ProjectCardResponse> listOpen(int page, int size);
    void requestToJoin(UUID projectId, UUID requesterId, JoinProjectRequest request);
    void respondToRequest(UUID joinRequestId, UUID currentUserId, ProjectJoinStatus decision);
}
