package com.incampus.modules.studypartner;

import com.incampus.common.response.PageResponse;
import com.incampus.modules.studypartner.dto.CreateStudyPartnerPostRequest;
import com.incampus.modules.studypartner.dto.StudyPartnerPostResponse;

import java.util.UUID;

public interface StudyPartnerService {
    StudyPartnerPostResponse create(UUID authorId, CreateStudyPartnerPostRequest request);
    PageResponse<StudyPartnerPostResponse> listOpen(int page, int size);
    void joinRequest(UUID postId, UUID userId);
    void closePost(UUID postId, UUID currentUserId);
}
