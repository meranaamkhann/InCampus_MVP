package com.incampus.modules.studypartner;

import com.incampus.common.exception.ApiException;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.studypartner.dto.CreateStudyPartnerPostRequest;
import com.incampus.modules.studypartner.dto.StudyPartnerPostResponse;
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
public class StudyPartnerServiceImpl implements StudyPartnerService {

    private final StudyPartnerPostRepository postRepository;
    private final StudyPartnerParticipantRepository participantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public StudyPartnerPostResponse create(UUID authorId, CreateStudyPartnerPostRequest request) {
        User author = userRepository.findById(authorId).orElseThrow(() -> ApiException.notFound("User not found"));
        StudyPartnerPost post = StudyPartnerPost.builder()
                .author(author)
                .subject(request.getSubject())
                .description(request.getDescription())
                .tags(request.getTags() != null ? request.getTags() : new java.util.HashSet<>())
                .build();
        postRepository.save(post);
        return toResponse(post);
    }

    @Override
    public PageResponse<StudyPartnerPostResponse> listOpen(int page, int size) {
        return PageResponse.from(postRepository.findByDeletedFalseAndOpenTrueOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(this::toResponse));
    }

    @Override
    @Transactional
    public void joinRequest(UUID postId, UUID userId) {
        StudyPartnerPost post = postRepository.findById(postId)
                .filter(p -> !p.isDeleted() && p.isOpen())
                .orElseThrow(() -> ApiException.notFound("Study partner post not found or closed"));
        if (participantRepository.existsByPostIdAndUserId(postId, userId)) return;
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        participantRepository.save(StudyPartnerParticipant.builder().post(post).user(user).build());
        // TODO(Phase 7 - Notifications): notify post.getAuthor() of the new join request.
    }

    @Override
    @Transactional
    public void closePost(UUID postId, UUID currentUserId) {
        StudyPartnerPost post = postRepository.findById(postId)
                .orElseThrow(() -> ApiException.notFound("Study partner post not found"));
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw ApiException.forbidden("Only the author can close this post");
        }
        post.setOpen(false);
        postRepository.save(post);
    }

    private StudyPartnerPostResponse toResponse(StudyPartnerPost post) {
        return StudyPartnerPostResponse.builder()
                .id(post.getId())
                .author(UserSummaryResponse.builder()
                        .id(post.getAuthor().getId())
                        .name(post.getAuthor().getName())
                        .profilePictureUrl(post.getAuthor().getProfilePictureUrl())
                        .college(post.getAuthor().getCollege())
                        .build())
                .subject(post.getSubject())
                .description(post.getDescription())
                .tags(post.getTags())
                .open(post.isOpen())
                .participantCount(participantRepository.countByPostId(post.getId()))
                .build();
    }
}
