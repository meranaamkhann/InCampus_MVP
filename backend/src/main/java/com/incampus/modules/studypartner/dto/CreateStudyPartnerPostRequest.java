package com.incampus.modules.studypartner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class CreateStudyPartnerPostRequest {
    @NotBlank
    private String subject;
    private String description;
    private Set<String> tags;
}
