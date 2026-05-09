package com.MeiGullak.SavingApp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "split_shares")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SplitShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private SplitExpense expense;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // What this person OWES (for equal/shares split)
    // OR what they still need to pay (for custom split)
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal shareAmount;

    // What this person ACTUALLY PAID at the spot
    // (only relevant for custom split)
    @Column(precision = 12, scale = 2)
    private BigDecimal paidAmount;

    @Builder.Default
    private boolean settled = false;
}
