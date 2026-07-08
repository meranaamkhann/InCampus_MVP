package com.incampus.modules.user;

import com.incampus.common.exception.ApiException;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.user.dto.UpdateProfileRequest;
import com.incampus.modules.user.dto.UserProfileResponse;
import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserFollowRepository userFollowRepository;

    @Override
    public UserProfileResponse getProfile(UUID userId) {
        User user = findUserOrThrow(userId);
        return toProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findUserOrThrow(userId);

        if (request.getName() != null) user.setName(request.getName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getBranch() != null) user.setBranch(request.getBranch());
        if (request.getYear() != null) user.setYear(request.getYear());
        if (request.getInterests() != null) user.setInterests(request.getInterests());
        if (request.getSkills() != null) user.setSkills(request.getSkills());

        userRepository.save(user);
        return toProfileResponse(user);
    }

    @Override
    @Transactional
    public void follow(UUID currentUserId, UUID targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw ApiException.badRequest("You can't follow yourself");
        }
        if (userFollowRepository.existsByFollowerIdAndFollowingId(currentUserId, targetUserId)) {
            return; // idempotent
        }
        User follower = findUserOrThrow(currentUserId);
        User following = findUserOrThrow(targetUserId);

        userFollowRepository.save(UserFollow.builder().follower(follower).following(following).build());
        // TODO(Phase 7 - Notifications): publish a FRIEND_REQUEST-style "new follower" notification event here.
    }

    @Override
    @Transactional
    public void unfollow(UUID currentUserId, UUID targetUserId) {
        userFollowRepository.findByFollowerIdAndFollowingId(currentUserId, targetUserId)
                .ifPresent(userFollowRepository::delete);
    }

    @Override
    public PageResponse<UserSummaryResponse> getFollowers(UUID userId, int page, int size) {
        Page<UserFollow> follows = userFollowRepository.findByFollowingId(userId, PageRequest.of(page, size));
        return PageResponse.from(follows.map(f -> toSummary(f.getFollower())));
    }

    @Override
    public PageResponse<UserSummaryResponse> getFollowing(UUID userId, int page, int size) {
        Page<UserFollow> follows = userFollowRepository.findByFollowerId(userId, PageRequest.of(page, size));
        return PageResponse.from(follows.map(f -> toSummary(f.getFollowing())));
    }

    @Override
    public PageResponse<UserSummaryResponse> search(String query, int page, int size) {
        Page<User> results = userRepository.search(query, PageRequest.of(page, size));
        return PageResponse.from(results.map(this::toSummary));
    }

    // --- helpers ---

    private User findUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .college(user.getCollege())
                .branch(user.getBranch())
                .year(user.getYear())
                .bio(user.getBio())
                .profilePictureUrl(user.getProfilePictureUrl())
                .interests(user.getInterests())
                .skills(user.getSkills())
                .badges(user.getBadges())
                .role(user.getRole())
                .verificationStatus(user.getVerificationStatus())
                .followersCount(userFollowRepository.countByFollowingId(user.getId()))
                .followingCount(userFollowRepository.countByFollowerId(user.getId()))
                .build();
    }

    private UserSummaryResponse toSummary(User user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .college(user.getCollege())
                .build();
    }
}
