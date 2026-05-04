package com.MeiGullak.SavingApp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "gullaks")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Gullak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String goalName;

    private String icon;
    private String color;
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal targetAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal savedAmount = BigDecimal.ZERO;

    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private GullakStatus status = GullakStatus.ACTIVE;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public double getProgressPercentage() {
        if (targetAmount == null || targetAmount.compareTo(BigDecimal.ZERO) == 0) return 0;
        double saved = savedAmount.doubleValue();
        double target = targetAmount.doubleValue();
        return Math.round((saved / target) * 10000.0) / 100.0;
    }

    public BigDecimal getRemainingAmount() {
        BigDecimal remaining = targetAmount.subtract(savedAmount);
        return remaining.compareTo(BigDecimal.ZERO) < 0
                ? BigDecimal.ZERO : remaining;
    }

    public enum GullakStatus {
        ACTIVE, COMPLETED, PAUSED
    }
}