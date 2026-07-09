package com.incampus.modules.post;

import com.incampus.common.enums.NotificationType;
import com.incampus.common.enums.ReportTargetType;
import com.incampus.common.exception.ApiException;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.like.Like;
import com.incampus.modules.like.LikeRepository;
import com.incampus.modules.notification.NotificationService;
import com.incampus.modules.post.dto.CreatePostRequest;
import com.incampus.modules.post.dto.PostResponse;
import com.incampus.modules.user.User;
import com.incampus.modules.user.UserRepository;
import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final PostSaveRepository postSaveRepository;
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public PostResponse createPost(UUID authorId, CreatePostRequest request) {
        User author = findUserOrThrow(authorId);

        Post post = Post.builder()
                .author(author)
                .type(request.getType())
                .content(request.getContent())
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : new java.util.ArrayList<>())
                .pollOptions(request.getPollOptions() != null ? request.getPollOptions() : new java.util.ArrayList<>())
                .linkedEventId(request.getLinkedEventId())
                .build();

        postRepository.save(post);
        return toResponse(post, authorId);
    }

    @Override
    public PostResponse getPost(UUID postId, UUID currentUserId) {
        Post post = findPostOrThrow(postId);
        return toResponse(post, currentUserId);
    }

    @Override
    public PageResponse<PostResponse> getFeed(UUID currentUserId, int page, int size) {
        User currentUser = findUserOrThrow(currentUserId);
        Page<Post> posts = postRepository.findByAuthor_CollegeAndDeletedFalseOrderByCreatedAtDesc(
                currentUser.getCollege(), PageRequest.of(page, size));
        return PageResponse.from(posts.map(p -> toResponse(p, currentUserId)));
    }

    @Override
    public PageResponse<PostResponse> getPostsByUser(UUID authorId, UUID currentUserId, int page, int size) {
        Page<Post> posts = postRepository.findByAuthorIdAndDeletedFalseOrderByCreatedAtDesc(authorId, PageRequest.of(page, size));
        return PageResponse.from(posts.map(p -> toResponse(p, currentUserId)));
    }

    @Override
    @Transactional
    public void deletePost(UUID postId, UUID currentUserId) {
        Post post = findPostOrThrow(postId);
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw ApiException.forbidden("You can only delete your own posts");
        }
        post.setDeleted(true);
        postRepository.save(post);
    }

    @Override
    @Transactional
    public void likePost(UUID postId, UUID currentUserId) {
        Post post = findPostOrThrow(postId);
        if (likeRepository.existsByUserIdAndTargetTypeAndTargetId(currentUserId, ReportTargetType.POST, postId)) {
            return; // idempotent
        }
        User user = findUserOrThrow(currentUserId);
        likeRepository.save(Like.builder().user(user).targetType(ReportTargetType.POST).targetId(postId).build());
        post.setLikeCount(post.getLikeCount() + 1);
        postRepository.save(post);

        if (!post.getAuthor().getId().equals(currentUserId)) {
            notificationService.notify(
                    post.getAuthor().getId(),
                    currentUserId,
                    NotificationType.LIKE,
                    post.getId(),
                    user.getName() + " liked your post");
        }
    }

    @Override
    @Transactional
    public void unlikePost(UUID postId, UUID currentUserId) {
        Post post = findPostOrThrow(postId);
        likeRepository.findByUserIdAndTargetTypeAndTargetId(currentUserId, ReportTargetType.POST, postId)
                .ifPresent(like -> {
                    likeRepository.delete(like);
                    post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
                    postRepository.save(post);
                });
    }

    @Override
    @Transactional
    public void savePost(UUID postId, UUID currentUserId) {
        if (postSaveRepository.existsByPostIdAndUserId(postId, currentUserId)) {
            return;
        }
        Post post = findPostOrThrow(postId);
        User user = findUserOrThrow(currentUserId);
        postSaveRepository.save(PostSave.builder().post(post).user(user).build());
    }

    @Override
    @Transactional
    public void unsavePost(UUID postId, UUID currentUserId) {
        postSaveRepository.findByPostIdAndUserId(postId, currentUserId).ifPresent(postSaveRepository::delete);
    }

    @Override
    public PageResponse<PostResponse> getSavedPosts(UUID currentUserId, int page, int size) {
        Page<PostSave> saves = postSaveRepository.findByUserId(currentUserId, PageRequest.of(page, size));
        return PageResponse.from(saves.map(s -> toResponse(s.getPost(), currentUserId)));
    }

    // --- helpers ---

    private Post findPostOrThrow(UUID postId) {
        return postRepository.findById(postId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> ApiException.notFound("Post not found"));
    }

    private User findUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private PostResponse toResponse(Post post, UUID currentUserId) {
        boolean liked = currentUserId != null &&
                likeRepository.existsByUserIdAndTargetTypeAndTargetId(currentUserId, ReportTargetType.POST, post.getId());
        boolean saved = currentUserId != null &&
                postSaveRepository.existsByPostIdAndUserId(post.getId(), currentUserId);

        return PostResponse.builder()
                .id(post.getId())
                .author(UserSummaryResponse.builder()
                        .id(post.getAuthor().getId())
                        .name(post.getAuthor().getName())
                        .profilePictureUrl(post.getAuthor().getProfilePictureUrl())
                        .college(post.getAuthor().getCollege())
                        .build())
                .type(post.getType())
                .content(post.getContent())
                .imageUrls(post.getImageUrls())
                .pollOptions(post.getPollOptions())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .likedByCurrentUser(liked)
                .savedByCurrentUser(saved)
                .createdAt(post.getCreatedAt())
                .build();
    }
}
