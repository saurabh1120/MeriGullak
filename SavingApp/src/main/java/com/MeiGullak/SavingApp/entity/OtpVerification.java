package com.MeiGullak.SavingApp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String identifier; // email or mobile

    @Column(nullable = false)
    private String otp;

    @Enumerated(EnumType.STRING)
    private OtpType type; // EMAIL or MOBILE

    @Enumerated(EnumType.STRING)
    private OtpPurpose purpose; // REGISTRATION or LOGIN

    @Builder.Default
    private boolean used = false;

    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public enum OtpType {
        EMAIL, MOBILE
    }

    public enum OtpPurpose {
        REGISTRATION, LOGIN ,PASSWORD_RESET
    }
}