package com.incampus.modules.comment;

import com.incampus.common.response.ApiResponse;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.comment.dto.CommentResponse;
import com.incampus.modules.comment.dto.CreateCommentRequest;
import com.incampus.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/api/posts/{postId}/comments")
    public ApiResponse<CommentResponse> add(@AuthenticationPrincipal UserPrincipal principal,
                                             @PathVariable UUID postId,
                                             @Valid @RequestBody CreateCommentRequest request) {
        return ApiResponse.ok(commentService.addComment(postId, principal.getId(), request));
    }

    @GetMapping("/api/posts/{postId}/comments")
    public ApiResponse<PageResponse<CommentResponse>> list(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(commentService.getComments(postId, page, size));
    }

    @GetMapping("/api/comments/{commentId}/replies")
    public ApiResponse<PageResponse<CommentResponse>> replies(
            @PathVariable UUID commentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(commentService.getReplies(commentId, page, size));
    }

    @DeleteMapping("/api/comments/{commentId}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID commentId) {
        commentService.deleteComment(commentId, principal.getId());
        return ApiResponse.ok("Comment deleted", null);
    }
}
