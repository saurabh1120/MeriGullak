package com.MeiGullak.SavingApp.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BalanceSummary {
    private BigDecimal totalYouOwe;
    private BigDecimal totalOwedToYou;
    private BigDecimal netBalance;
    private List<UserBalance> balances;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class UserBalance {
        private Long userId;
        private String userName;
        private String userEmail;
        private BigDecimal amount;
        // positive = they owe you, negative = you owe them
    }
}