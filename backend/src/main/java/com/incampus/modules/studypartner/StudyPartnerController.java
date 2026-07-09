package com.incampus.modules.studypartner;

import com.incampus.common.response.ApiResponse;
import com.incampus.common.response.PageResponse;
import com.incampus.modules.studypartner.dto.CreateStudyPartnerPostRequest;
import com.incampus.modules.studypartner.dto.StudyPartnerPostResponse;
import com.incampus.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/study-partners")
@RequiredArgsConstructor
public class StudyPartnerController {

    private final StudyPartnerService studyPartnerService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<StudyPartnerPostResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                          @Valid @RequestBody CreateStudyPartnerPostRequest request) {
        return ApiResponse.ok(studyPartnerService.create(principal.getId(), request));
    }

    @GetMapping
    public ApiResponse<PageResponse<StudyPartnerPostResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(studyPartnerService.listOpen(page, size));
    }

    @PostMapping("/{postId}/join")
    public ApiResponse<Void> join(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID postId) {
        studyPartnerService.joinRequest(postId, principal.getId());
        return ApiResponse.ok("Join request sent", null);
    }

    @PostMapping("/{postId}/close")
    public ApiResponse<Void> close(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID postId) {
        studyPartnerService.closePost(postId, principal.getId());
        return ApiResponse.ok("Post closed", null);
    }
}
