package com.MeiGullak.SavingApp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "split_expenses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SplitExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private SplitGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by", nullable = false)
    private User paidBy;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SplitType splitType = SplitType.EQUAL;

    private LocalDate expenseDate;
    private String receiptUrl;

    @OneToMany(mappedBy = "expense",
        cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SplitShare> shares;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum SplitType {
        EQUAL,   // divide equally among all members
        CUSTOM,  // manually enter amount per person
        SHARES   // enter shares per person (e.g. 2:1:1)
    }
}
