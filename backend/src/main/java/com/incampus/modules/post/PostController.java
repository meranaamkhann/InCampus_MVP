package com.incampus.modules.post;

import com.incampus.common.response.ApiResponse;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.post.dto.CreatePostRequest;
import com.incampus.modules.post.dto.PostResponse;
import com.incampus.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                             @Valid @RequestBody CreatePostRequest request) {
        return ApiResponse.ok(postService.createPost(principal.getId(), request));
    }

    @GetMapping("/feed")
    public ApiResponse<PageResponse<PostResponse>> feed(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(postService.getFeed(principal.getId(), page, size));
    }

    @GetMapping("/{postId}")
    public ApiResponse<PostResponse> getPost(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID postId) {
        return ApiResponse.ok(postService.getPost(postId, principal.getId()));
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<PageResponse<PostResponse>> byUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(postService.getPostsByUser(userId, principal.getId(), page, size));
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID postId) {
        postService.deletePost(postId, principal.getId());
        return ApiResponse.ok("Post deleted", null);
    }

    @PostMapping("/{postId}/like")
    public ApiResponse<Void> like(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID postId) {
        postService.likePost(postId, principal.getId());
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/{postId}/like")
    public ApiResponse<Void> unlike(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID postId) {
        postService.unlikePost(postId, principal.getId());
        return ApiResponse.ok(null);
    }

    @PostMapping("/{postId}/save")
    public ApiResponse<Void> save(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID postId) {
        postService.savePost(postId, principal.getId());
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/{postId}/save")
    public ApiResponse<Void> unsave(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID postId) {
        postService.unsavePost(postId, principal.getId());
        return ApiResponse.ok(null);
    }

    @GetMapping("/saved")
    public ApiResponse<PageResponse<PostResponse>> saved(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(postService.getSavedPosts(principal.getId(), page, size));
    }
}
