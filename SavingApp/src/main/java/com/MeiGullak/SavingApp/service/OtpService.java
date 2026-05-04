package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.entity.OtpVerification;
import com.MeiGullak.SavingApp.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final JavaMailSender mailSender;

    @Value("${app.otp.expiry}")
    private int otpExpiryMinutes;

    public void generateAndSendOtp(String email, OtpVerification.OtpPurpose purpose) {
        String otp = generateOtp();

        OtpVerification otpVerification = OtpVerification.builder()
                .identifier(email)
                .otp(otp)
                .type(OtpVerification.OtpType.EMAIL)
                .purpose(purpose)
                .used(false)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .build();

        otpRepository.save(otpVerification);
        sendOtpEmail(email, otp, purpose);
    }

    public boolean verifyOtp(String email, String otp, OtpVerification.OtpPurpose purpose) {
        var otpRecord = otpRepository
                .findTopByIdentifierAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                .orElse(null);

        if (otpRecord == null) return false;
        if (otpRecord.isExpired()) return false;
        if (!otpRecord.getOtp().equals(otp)) return false;

        otpRecord.setUsed(true);
        otpRepository.save(otpRecord);
        return true;
    }

    private String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    private void sendOtpEmail(String email, String otp, OtpVerification.OtpPurpose purpose) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Meri Gullak - OTP Verification");
        message.setText(
                "Your OTP for " + purpose.name().toLowerCase() + " is: " + otp +
                        "\n\nThis OTP is valid for " + otpExpiryMinutes + " minutes." +
                        "\n\nDo not share this OTP with anyone." +
                        "\n\n- Team Meri Gullak 🪙"
        );
        mailSender.send(message);
    }
}