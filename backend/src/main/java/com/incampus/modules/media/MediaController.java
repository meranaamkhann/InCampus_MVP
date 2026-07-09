package com.incampus.modules.media;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.incampus.common.exception.ApiException;
import com.incampus.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Thin wrapper so the frontend never needs a Cloudinary API secret client-side.
 * Files are uploaded here, InCampus proxies the upload to Cloudinary using
 * the server-side credentials, and only the resulting secure URL comes back.
 */
@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final Cloudinary cloudinary;

    @PostMapping("/upload")
    public ApiResponse<String> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw ApiException.badRequest("File is empty");
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", "incampus", "resource_type", "auto"));
            return ApiResponse.ok((String) result.get("secure_url"));
        } catch (IOException e) {
            throw ApiException.badRequest("Upload failed: " + e.getMessage());
        }
    }
}
