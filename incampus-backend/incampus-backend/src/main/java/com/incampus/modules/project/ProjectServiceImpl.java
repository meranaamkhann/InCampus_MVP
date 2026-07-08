package com.incampus.modules.project;

import com.incampus.common.enums.ProjectJoinStatus;
import com.incampus.common.exception.ApiException;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.project.dto.CreateProjectCardRequest;
import com.incampus.modules.project.dto.JoinProjectRequest;
import com.incampus.modules.project.dto.ProjectCardResponse;
import com.incampus.modules.user.User;
import com.incampus.modules.user.UserRepository;
import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectCardRepository projectCardRepository;
    private final ProjectJoinRequestRepository joinRequestRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ProjectCardResponse create(UUID authorId, CreateProjectCardRequest request) {
        User author = userRepository.findById(authorId).orElseThrow(() -> ApiException.notFound("User not found"));
        ProjectCard card = ProjectCard.builder()
                .author(author)
                .title(request.getTitle())
                .description(request.getDescription())
                .rolesNeeded(request.getRolesNeeded() != null ? request.getRolesNeeded() : new java.util.ArrayList<>())
                .build();
        projectCardRepository.save(card);
        return toResponse(card);
    }

    @Override
    public PageResponse<ProjectCardResponse> listOpen(int page, int size) {
        return PageResponse.from(projectCardRepository.findByDeletedFalseAndOpenTrueOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(this::toResponse));
    }

    @Override
    @Transactional
    public void requestToJoin(UUID projectId, UUID requesterId, JoinProjectRequest request) {
        if (joinRequestRepository.existsByProjectIdAndRequesterId(projectId, requesterId)) {
            throw ApiException.conflict("You've already requested to join this project");
        }
        ProjectCard project = projectCardRepository.findById(projectId)
                .filter(p -> !p.isDeleted() && p.isOpen())
                .orElseThrow(() -> ApiException.notFound("Project not found or closed"));
        User requester = userRepository.findById(requesterId).orElseThrow(() -> ApiException.notFound("User not found"));

        joinRequestRepository.save(ProjectJoinRequest.builder()
                .project(project)
                .requester(requester)
                .message(request.getMessage())
                .status(ProjectJoinStatus.PENDING)
                .build());
        // TODO(Phase 7 - Notifications): notify project.getAuthor() of the new join request.
    }

    @Override
    @Transactional
    public void respondToRequest(UUID joinRequestId, UUID currentUserId, ProjectJoinStatus decision) {
        ProjectJoinRequest joinRequest = joinRequestRepository.findById(joinRequestId)
                .orElseThrow(() -> ApiException.notFound("Join request not found"));

        if (!joinRequest.getProject().getAuthor().getId().equals(currentUserId)) {
            throw ApiException.forbidden("Only the project owner can respond to join requests");
        }
        joinRequest.setStatus(decision);
        joinRequestRepository.save(joinRequest);
        // TODO(Phase 7 - Notifications): notify joinRequest.getRequester() of the decision.
    }

    private ProjectCardResponse toResponse(ProjectCard card) {
        return ProjectCardResponse.builder()
                .id(card.getId())
                .author(UserSummaryResponse.builder()
                        .id(card.getAuthor().getId())
                        .name(card.getAuthor().getName())
                        .profilePictureUrl(card.getAuthor().getProfilePictureUrl())
                        .college(card.getAuthor().getCollege())
                        .build())
                .title(card.getTitle())
                .description(card.getDescription())
                .rolesNeeded(card.getRolesNeeded())
                .open(card.isOpen())
                .build();
    }
}
