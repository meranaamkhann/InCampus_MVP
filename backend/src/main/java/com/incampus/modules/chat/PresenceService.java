package com.incampus.modules.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * Presence is intentionally NOT modeled as a DB column - it's short-lived,
 * high-write, and doesn't need to survive a restart. A Redis key with a TTL
 * is refreshed on every heartbeat/activity; if the key expires, the user is
 * considered offline. Simpler and cheaper than DB writes per keystroke.
 */
@Service
@RequiredArgsConstructor
public class PresenceService {

    private final StringRedisTemplate redisTemplate;
    private static final Duration ONLINE_TTL = Duration.ofSeconds(60);

    public void markOnline(UUID userId) {
        redisTemplate.opsForValue().set(key(userId), "online", ONLINE_TTL);
    }

    public void markOffline(UUID userId) {
        redisTemplate.delete(key(userId));
    }

    public boolean isOnline(UUID userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key(userId)));
    }

    private String key(UUID userId) {
        return "presence:" + userId;
    }
}
