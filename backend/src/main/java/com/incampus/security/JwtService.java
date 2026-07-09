package com.incampus.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long accessTokenExpiryMs;
    private final long refreshTokenExpiryMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiry-ms}") long accessTokenExpiryMs,
            @Value("${app.jwt.refresh-token-expiry-ms}") long refreshTokenExpiryMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenExpiryMs = accessTokenExpiryMs;
        this.refreshTokenExpiryMs = refreshTokenExpiryMs;
    }

    public String generateAccessToken(UUID userId, String email, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claim("uid", userId.toString())
                .claim("role", role)
                .claim("type", "access")
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessTokenExpiryMs))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Opaque refresh token, prefixed with the userId so refresh() can look
     * the right user up before comparing against their stored hash. Format:
     * base64url(userId) + "." + 64 random bytes (base64url). Only the hash
     * of the full token is ever stored server-side.
     */
    public String generateRawRefreshToken(UUID userId) {
        byte[] randomBytes = new byte[64];
        new SecureRandom().nextBytes(randomBytes);
        String userIdPart = Base64.getUrlEncoder().withoutPadding().encodeToString(userId.toString().getBytes());
        String randomPart = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        return userIdPart + "." + randomPart;
    }

    public UUID extractUserIdFromRefreshToken(String rawRefreshToken) {
        int dot = rawRefreshToken.indexOf('.');
        if (dot < 0) {
            throw new IllegalArgumentException("Malformed refresh token");
        }
        String userIdPart = rawRefreshToken.substring(0, dot);
        String decoded = new String(Base64.getUrlDecoder().decode(userIdPart));
        return UUID.fromString(decoded);
    }

    public long getRefreshTokenExpiryMs() {
        return refreshTokenExpiryMs;
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public UUID extractUserId(String token) {
        String uid = extractClaim(token, claims -> claims.get("uid", String.class));
        return UUID.fromString(uid);
    }

    public boolean isTokenValid(String token, String expectedEmail) {
        try {
            String email = extractEmail(token);
            return email.equals(expectedEmail) && !isExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }
}
