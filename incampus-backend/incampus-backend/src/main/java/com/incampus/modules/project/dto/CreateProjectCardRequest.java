package com.incampus.modules.project.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateProjectCardRequest {
    @NotBlank
    private String title;
    private String description;
    private List<String> rolesNeeded;
}
