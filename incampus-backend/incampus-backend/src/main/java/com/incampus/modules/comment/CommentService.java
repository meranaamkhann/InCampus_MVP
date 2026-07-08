package com.incampus.modules.comment;

import com.incampus.common.response.PageResponse;
import com.incampus.modules.comment.dto.CommentResponse;
import com.incampus.modules.comment.dto.CreateCommentRequest;

import java.util.UUID;

public interface CommentService {
    CommentResponse addComment(UUID postId, UUID authorId, CreateCommentRequest request);
    PageResponse<CommentResponse> getComments(UUID postId, int page, int size);
    PageResponse<CommentResponse> getReplies(UUID commentId, int page, int size);
    void deleteComment(UUID commentId, UUID currentUserId);
}
