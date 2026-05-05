package com.MeiGullak.SavingApp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "split_settlements")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SplitSettlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private SplitGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by", nullable = false)
    private User paidBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_to", nullable = false)
    private User paidTo;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    private String note;
    private LocalDateTime settledAt;

    @PrePersist
    protected void onCreate() {
        settledAt = LocalDateTime.now();
    }
}