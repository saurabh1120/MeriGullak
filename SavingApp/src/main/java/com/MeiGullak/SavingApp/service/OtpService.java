package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.entity.OtpVerification;
import com.MeiGullak.SavingApp.repository.OtpVerificationRepository;
import com.MeiGullak.SavingApp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Value("${app.otp.expiry}")
    private int otpExpiryMinutes;

    public void generateAndSendOtp(
            String email,
            OtpVerification.OtpPurpose purpose
    ) {
        String otp = generateOtp();

        OtpVerification otpVerification = OtpVerification.builder()
                .identifier(email)
                .otp(otp)
                .type(OtpVerification.OtpType.EMAIL)
                .purpose(purpose)
                .used(false)
                .expiresAt(LocalDateTime.now()
                        .plusMinutes(otpExpiryMinutes))
                .build();

        otpRepository.save(otpVerification);

        // Get user name for personalized email
        String name = userRepository.findByEmail(email)
                .map(u -> u.getFullName())
                .orElse("User");

        emailService.sendOtpEmail(
                email, name, otp, purpose.name());
    }

    public boolean verifyOtp(
            String email, String otp,
            OtpVerification.OtpPurpose purpose
    ) {
        var otpRecord = otpRepository
                .findTopByIdentifierAndPurposeAndUsedFalseOrderByCreatedAtDesc(
                        email, purpose)
                .orElse(null);

        if (otpRecord == null) return false;
        if (otpRecord.isExpired()) return false;
        if (!otpRecord.getOtp().equals(otp)) return false;

        otpRecord.setUsed(true);
        otpRepository.save(otpRecord);
        return true;
    }

    private String generateOtp() {
        return String.valueOf(
                100000 + new Random().nextInt(900000));
    }
}