package com.incampus.modules.auth;

import com.incampus.common.enums.VerificationStatus;
import com.incampus.common.exception.ApiException;
import com.incampus.common.util.EmailService;
import com.incampus.common.util.OtpUtil;
import com.incampus.modules.auth.dto.AuthResponse;
import com.incampus.modules.auth.dto.ForgotPasswordRequest;
import com.incampus.modules.auth.dto.LoginRequest;
import com.incampus.modules.auth.dto.OtpVerifyRequest;
import com.incampus.modules.auth.dto.RefreshTokenRequest;
import com.incampus.modules.auth.dto.ResetPasswordRequest;
import com.incampus.modules.auth.dto.SignupRequest;
import com.incampus.modules.user.User;
import com.incampus.modules.user.UserRepository;
import com.incampus.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;

    // BCrypt is also fine for hashing OTPs / refresh tokens - reuse the same encoder.
    private final BCryptPasswordEncoder otpEncoder = new BCryptPasswordEncoder(10);

    @Value("${app.auth.allowed-email-domains}")
    private String allowedDomainsCsv;

    @Value("${app.auth.otp-expiry-minutes}")
    private long otpExpiryMinutes;

    @Override
    @Transactional
    public void signup(SignupRequest request) {
        validateCollegeEmail(request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw ApiException.conflict("An account with this email already exists");
        }

        String otp = OtpUtil.generate();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .college(request.getCollege())
                .branch(request.getBranch())
                .year(request.getYear())
                .verificationStatus(VerificationStatus.PENDING)
                .otpCodeHash(otpEncoder.encode(otp))
                .otpExpiresAt(Instant.now().plusSeconds(otpExpiryMinutes * 60))
                .build();

        userRepository.save(user);
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Override
    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> ApiException.notFound("No account found for this email"));

        if (user.getVerificationStatus() == VerificationStatus.VERIFIED) {
            throw ApiException.badRequest("Account is already verified");
        }

        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("OTP has expired. Please request a new one.");
        }

        if (user.getOtpCodeHash() == null || !otpEncoder.matches(request.getOtp(), user.getOtpCodeHash())) {
            throw ApiException.badRequest("Invalid OTP");
        }

        user.setVerificationStatus(VerificationStatus.VERIFIED);
        user.setOtpCodeHash(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        return issueTokens(user);
    }

    @Override
    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> ApiException.notFound("No account found for this email"));

        if (user.getVerificationStatus() == VerificationStatus.VERIFIED) {
            throw ApiException.badRequest("Account is already verified");
        }

        String otp = OtpUtil.generate();
        user.setOtpCodeHash(otpEncoder.encode(otp));
        user.setOtpExpiresAt(Instant.now().plusSeconds(otpExpiryMinutes * 60));
        userRepository.save(user);
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        if (user.isBanned()) {
            throw ApiException.forbidden("This account has been banned");
        }

        if (user.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw ApiException.forbidden("Please verify your college email before logging in");
        }

        // Delegates to DaoAuthenticationProvider -> throws BadCredentialsException on mismatch,
        // handled centrally by GlobalExceptionHandler.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        return issueTokens(user);
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        // NOTE: since the raw refresh token isn't tied to a user in this call,
        // a real implementation should encode the userId alongside the opaque
        // token (e.g. "<userId>.<opaqueToken>") so we can look the user up
        // before matching the hash. Wiring that up is part of Phase 2.
        throw new UnsupportedOperationException(
                "Refresh token rotation lookup - implement in Phase 2 (Auth hardening) once token format is finalized");
    }

    @Override
    @Transactional
    public void logout(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        user.setCurrentRefreshTokenHash(null);
        user.setRefreshTokenExpiresAt(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> ApiException.notFound("No account found for this email"));

        String otp = OtpUtil.generate();
        user.setOtpCodeHash(otpEncoder.encode(otp));
        user.setOtpExpiresAt(Instant.now().plusSeconds(otpExpiryMinutes * 60));
        userRepository.save(user);
        emailService.sendPasswordResetOtp(user.getEmail(), otp);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> ApiException.notFound("No account found for this email"));

        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("Reset code has expired. Please request a new one.");
        }

        if (user.getOtpCodeHash() == null || !otpEncoder.matches(request.getOtp(), user.getOtpCodeHash())) {
            throw ApiException.badRequest("Invalid reset code");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCodeHash(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);
    }

    // --- helpers ---

    private void validateCollegeEmail(String email) {
        List<String> allowedDomains = Arrays.asList(allowedDomainsCsv.split(","));
        boolean allowed = allowedDomains.stream().anyMatch(domain -> email.toLowerCase().endsWith(domain.trim().toLowerCase()));
        if (!allowed) {
            throw ApiException.badRequest("Only college emails (" + allowedDomainsCsv + ") are accepted");
        }
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String rawRefreshToken = jwtService.generateRawRefreshToken();

        user.setCurrentRefreshTokenHash(otpEncoder.encode(rawRefreshToken));
        user.setRefreshTokenExpiresAt(Instant.now().plusMillis(jwtService.getRefreshTokenExpiryMs()));
        userRepository.save(user);

        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .expiresInMs(jwtService.getRefreshTokenExpiryMs())
                .build();
    }
}
