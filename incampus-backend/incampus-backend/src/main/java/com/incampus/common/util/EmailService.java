package com.incampus.common.util;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your InCampus verification code");
        message.setText("Your verification code is: " + otp + "\nThis code expires in 10 minutes.\n\n" +
                "If you didn't request this, ignore this email.");
        mailSender.send(message);
    }

    public void sendPasswordResetOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("InCampus password reset code");
        message.setText("Your password reset code is: " + otp + "\nThis code expires in 10 minutes.\n\n" +
                "If you didn't request this, you can safely ignore this email.");
        mailSender.send(message);
    }
}
