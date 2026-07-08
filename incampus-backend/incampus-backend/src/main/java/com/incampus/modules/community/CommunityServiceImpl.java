package com.incampus.modules.community;

import com.incampus.common.exception.ApiException;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.community.dto.CommunityResponse;
import com.incampus.modules.community.dto.CreateCommunityRequest;
import com.incampus.modules.user.User;
import com.incampus.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CommunityResponse create(UUID creatorId, CreateCommunityRequest request) {
        if (communityRepository.findByNameIgnoreCase(request.getName()).isPresent()) {
            throw ApiException.conflict("A community with this name already exists");
        }
        User creator = userRepository.findById(creatorId).orElseThrow(() -> ApiException.notFound("User not found"));

        Community community = Community.builder()
                .name(request.getName())
                .description(request.getDescription())
                .bannerUrl(request.getBannerUrl())
                .createdBy(creator)
                .build();
        communityRepository.save(community);

        // Creator auto-joins as the first member.
        joinInternal(community, creator);

        return toResponse(community, creatorId);
    }

    @Override
    public CommunityResponse get(UUID communityId, UUID currentUserId) {
        Community community = findOrThrow(communityId);
        return toResponse(community, currentUserId);
    }

    @Override
    public PageResponse<CommunityResponse> list(String query, UUID currentUserId, int page, int size) {
        Page<Community> communities = StringUtils.hasText(query)
                ? communityRepository.findByNameContainingIgnoreCaseAndDeletedFalse(query, PageRequest.of(page, size))
                : communityRepository.findByDeletedFalse(PageRequest.of(page, size));
        return PageResponse.from(communities.map(c -> toResponse(c, currentUserId)));
    }

    @Override
    @Transactional
    public void join(UUID communityId, UUID userId) {
        Community community = findOrThrow(communityId);
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        joinInternal(community, user);
    }

    @Override
    @Transactional
    public void leave(UUID communityId, UUID userId) {
        communityMemberRepository.findByCommunityIdAndUserId(communityId, userId).ifPresent(member -> {
            communityMemberRepository.delete(member);
            Community community = member.getCommunity();
            community.setMemberCount(Math.max(0, community.getMemberCount() - 1));
            communityRepository.save(community);
        });
    }

    private void joinInternal(Community community, User user) {
        if (communityMemberRepository.existsByCommunityIdAndUserId(community.getId(), user.getId())) {
            return;
        }
        communityMemberRepository.save(CommunityMember.builder().community(community).user(user).build());
        community.setMemberCount(community.getMemberCount() + 1);
        communityRepository.save(community);
    }

    private Community findOrThrow(UUID communityId) {
        return communityRepository.findById(communityId)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> ApiException.notFound("Community not found"));
    }

    private CommunityResponse toResponse(Community community, UUID currentUserId) {
        boolean joined = currentUserId != null &&
                communityMemberRepository.existsByCommunityIdAndUserId(community.getId(), currentUserId);
        return CommunityResponse.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .bannerUrl(community.getBannerUrl())
                .memberCount(community.getMemberCount())
                .joinedByCurrentUser(joined)
                .build();
    }
}
