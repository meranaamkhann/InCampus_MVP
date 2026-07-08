package com.incampus.modules.admin;

import com.incampus.common.enums.ReportStatus;
import com.incampus.common.enums.VerificationStatus;
import com.incampus.common.exception.ApiException;
import com.incampus.modules.admin.dto.AdminAnalyticsResponse;
import com.incampus.modules.community.CommunityRepository;
import com.incampus.modules.event.EventRepository;
import com.incampus.modules.post.Post;
import com.incampus.modules.post.PostRepository;
import com.incampus.modules.report.ReportRepository;
import com.incampus.modules.user.User;
import com.incampus.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommunityRepository communityRepository;
    private final EventRepository eventRepository;
    private final ReportRepository reportRepository;

    @Override
    @Transactional
    public void banUser(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        user.setBanned(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void unbanUser(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        user.setBanned(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void removePost(UUID postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> ApiException.notFound("Post not found"));
        post.setDeleted(true);
        postRepository.save(post);
    }

    @Override
    public AdminAnalyticsResponse getAnalytics() {
        // NOTE (skeleton): counting via repository.count() is fine at MVP scale;
        // Phase 8 hardening should replace these with cached/materialized counts
        // (e.g. a nightly aggregate table) once data volume grows.
        long verifiedUsers = userRepository.findAll().stream()
                .filter(u -> u.getVerificationStatus() == VerificationStatus.VERIFIED)
                .count();
        long bannedUsers = userRepository.findAll().stream().filter(User::isBanned).count();

        return AdminAnalyticsResponse.builder()
                .totalUsers(userRepository.count())
                .verifiedUsers(verifiedUsers)
                .bannedUsers(bannedUsers)
                .totalPosts(postRepository.count())
                .totalCommunities(communityRepository.count())
                .totalEvents(eventRepository.count())
                .pendingReports(reportRepository.findByStatus(ReportStatus.PENDING, PageRequest.of(0, 1)).getTotalElements())
                .build();
    }
}
