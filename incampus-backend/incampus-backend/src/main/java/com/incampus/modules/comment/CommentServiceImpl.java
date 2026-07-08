package com.incampus.modules.comment;

import com.incampus.common.exception.ApiException;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.comment.dto.CommentResponse;
import com.incampus.modules.comment.dto.CreateCommentRequest;
import com.incampus.modules.post.Post;
import com.incampus.modules.post.PostRepository;
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
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CommentResponse addComment(UUID postId, UUID authorId, CreateCommentRequest request) {
        Post post = postRepository.findById(postId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> ApiException.notFound("Post not found"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        Comment parent = null;
        if (request.getParentCommentId() != null) {
            parent = commentRepository.findById(request.getParentCommentId())
                    .filter(c -> !c.isDeleted())
                    .orElseThrow(() -> ApiException.notFound("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .post(post)
                .author(author)
                .parentComment(parent)
                .content(request.getContent())
                .build();
        commentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);
        // TODO(Phase 7 - Notifications): notify post.getAuthor() (and parent comment author, if a reply).

        return toResponse(comment);
    }

    @Override
    public PageResponse<CommentResponse> getComments(UUID postId, int page, int size) {
        var comments = commentRepository.findByPostIdAndParentCommentIsNullAndDeletedFalseOrderByCreatedAtAsc(
                postId, PageRequest.of(page, size));
        return PageResponse.from(comments.map(this::toResponse));
    }

    @Override
    public PageResponse<CommentResponse> getReplies(UUID commentId, int page, int size) {
        var replies = commentRepository.findByParentCommentIdAndDeletedFalseOrderByCreatedAtAsc(
                commentId, PageRequest.of(page, size));
        return PageResponse.from(replies.map(this::toResponse));
    }

    @Override
    @Transactional
    public void deleteComment(UUID commentId, UUID currentUserId) {
        Comment comment = commentRepository.findById(commentId)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> ApiException.notFound("Comment not found"));

        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw ApiException.forbidden("You can only delete your own comments");
        }

        comment.setDeleted(true);
        commentRepository.save(comment);

        Post post = comment.getPost();
        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        postRepository.save(post);
    }

    private CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .author(UserSummaryResponse.builder()
                        .id(comment.getAuthor().getId())
                        .name(comment.getAuthor().getName())
                        .profilePictureUrl(comment.getAuthor().getProfilePictureUrl())
                        .college(comment.getAuthor().getCollege())
                        .build())
                .content(comment.getContent())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .likeCount(comment.getLikeCount())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
