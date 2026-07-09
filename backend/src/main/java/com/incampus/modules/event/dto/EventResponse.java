package com.incampus.modules.event.dto;

import com.incampus.common.enums.EventCategory;
import com.incampus.modules.user.dto.UserSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private UUID id;
    private UserSummaryResponse organizer;
    private String title;
    private String description;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String location;
    private Double latitude;
    private Double longitude;
    private Integer maxParticipants;
    private EventCategory category;
    private String bannerUrl;
    private long joinedCount;
    private long interestedCount;
    private String currentUserStatus; // JOINED / INTERESTED / null
}
