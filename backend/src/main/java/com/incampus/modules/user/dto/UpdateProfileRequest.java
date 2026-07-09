package com.incampus.modules.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class UpdateProfileRequest {

    @Size(max = 60)
    private String name;

    @Size(max = 300)
    private String bio;

    private String branch;

    private Integer year;

    private Set<String> interests;

    private Set<String> skills;
}
