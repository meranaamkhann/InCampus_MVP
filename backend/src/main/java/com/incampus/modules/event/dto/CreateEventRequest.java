package com.incampus.modules.event.dto;

import com.incampus.common.enums.EventCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class CreateEventRequest {
    @NotBlank
    private String title;
    private String description;
    @NotNull
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String location;
    private Double latitude;
    private Double longitude;
    private Integer maxParticipants;
    @NotNull
    private EventCategory category;
    private String bannerUrl;
}
