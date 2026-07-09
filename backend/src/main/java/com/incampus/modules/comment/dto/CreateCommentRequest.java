package com.incampus.modules.comment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateCommentRequest {

    @NotBlank
    private String content;

    private UUID parentCommentId; // null = top-level comment
}
