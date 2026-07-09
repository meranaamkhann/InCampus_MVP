package com.incampus.modules.post;

import com.incampus.common.response.PageResponse;
import com.incampus.modules.post.dto.CreatePostRequest;
import com.incampus.modules.post.dto.PostResponse;

import java.util.UUID;

public interface PostService {

    PostResponse createPost(UUID authorId, CreatePostRequest request);

    PostResponse getPost(UUID postId, UUID currentUserId);

    /** Campus-only feed: posts from the current user's college, newest first. */
    PageResponse<PostResponse> getFeed(UUID currentUserId, int page, int size);

    PageResponse<PostResponse> getPostsByUser(UUID authorId, UUID currentUserId, int page, int size);

    void deletePost(UUID postId, UUID currentUserId);

    void likePost(UUID postId, UUID currentUserId);

    void unlikePost(UUID postId, UUID currentUserId);

    void savePost(UUID postId, UUID currentUserId);

    void unsavePost(UUID postId, UUID currentUserId);

    PageResponse<PostResponse> getSavedPosts(UUID currentUserId, int page, int size);
}
