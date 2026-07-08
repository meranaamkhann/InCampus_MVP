package com.incampus.modules.post.dto;

import com.incampus.common.enums.PostType;
import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private UUID id;
    private UserSummaryResponse author;
    private PostType type;
    private String content;
    private List<String> imageUrls;
    private List<String> pollOptions;
    private long likeCount;
    private long commentCount;
    private boolean likedByCurrentUser;
    private boolean savedByCurrentUser;
    private Instant createdAt;
}
