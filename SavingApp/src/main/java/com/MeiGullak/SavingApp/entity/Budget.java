package com.MeiGullak.SavingApp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.math.*;

@Entity
@Table(name = "budgets")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Expense.ExpenseCategory category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal budgetAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal spentAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false)
    private int year;

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

    public double getUsagePercentage() {
        if (budgetAmount == null || budgetAmount.compareTo(BigDecimal.ZERO) == 0) return 0;
        double spent = spentAmount.doubleValue();
        double budget = budgetAmount.doubleValue();
        return Math.round((spent / budget) * 10000.0) / 100.0;
    }

    public boolean isOverBudget() {
        return spentAmount.compareTo(budgetAmount) > 0;
    }

    public boolean isNearLimit() {
        return getUsagePercentage() >= 80 && !isOverBudget();
    }
}