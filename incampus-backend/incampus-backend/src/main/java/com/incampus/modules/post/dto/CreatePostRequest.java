package com.incampus.modules.post.dto;

import com.incampus.common.enums.PostType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreatePostRequest {

    @NotNull
    private PostType type;

    private String content;

    private List<String> imageUrls;

    private List<String> pollOptions;

    private java.util.UUID linkedEventId;
}
