package com.MeiGullak.SavingApp.repository;

import com.MeiGullak.SavingApp.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByIdentifierAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            String identifier,
            OtpVerification.OtpPurpose purpose
    );
}