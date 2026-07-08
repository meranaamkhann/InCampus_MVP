package com.incampus.modules.comment.dto;

import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private UUID id;
    private UserSummaryResponse author;
    private String content;
    private UUID parentCommentId;
    private long likeCount;
    private Instant createdAt;
}
