package com.incampus.modules.auth;

import com.incampus.modules.auth.dto.AuthResponse;
import com.incampus.modules.auth.dto.ForgotPasswordRequest;
import com.incampus.modules.auth.dto.LoginRequest;
import com.incampus.modules.auth.dto.OtpVerifyRequest;
import com.incampus.modules.auth.dto.RefreshTokenRequest;
import com.incampus.modules.auth.dto.ResetPasswordRequest;
import com.incampus.modules.auth.dto.SignupRequest;

public interface AuthService {

    /** Creates the (unverified) user and emails an OTP to their college address. */
    void signup(SignupRequest request);

    /** Confirms the OTP, flips verificationStatus to VERIFIED. */
    AuthResponse verifyOtp(OtpVerifyRequest request);

    void resendOtp(String email);

    AuthResponse login(LoginRequest request);

    /** Rotates the refresh token and issues a new access token. */
    AuthResponse refresh(RefreshTokenRequest request);

    void logout(java.util.UUID userId);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
