package com.incampus.security;

import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory, per-IP token bucket limiting requests to /api/auth/**.
 * In-memory means this resets on restart and doesn't share state across
 * multiple backend instances - fine for the MVP's single-instance deploy
 * (Render/Railway free tier). If you scale to multiple instances, swap the
 * bucket store for the Bucket4j Redis/Lettuce integration instead - the
 * Bucket4j API calls below wouldn't need to change, just how buckets are
 * looked up/persisted.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final int authRequestsPerMinute;

    public RateLimitFilter(@Value("${app.rate-limit.auth-requests-per-minute}") int authRequestsPerMinute) {
        this.authRequestsPerMinute = authRequestsPerMinute;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if (!request.getRequestURI().startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = clientIp(request);
        Bucket bucket = buckets.computeIfAbsent(clientKey, k -> newBucket());

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Too many requests - please slow down and try again shortly.\"}");
        }
    }

    private Bucket newBucket() {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(authRequestsPerMinute).refillGreedy(authRequestsPerMinute, Duration.ofMinutes(1)))
                .build();
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
