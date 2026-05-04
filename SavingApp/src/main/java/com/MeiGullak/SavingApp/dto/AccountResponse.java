package com.MeiGullak.SavingApp.dto;

import com.MeiGullak.SavingApp.entity.Account;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AccountResponse {
    private Long id;
    private String accountName;
    private Account.AccountType accountType;
    private BigDecimal balance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private String bankName;
    private String accountNumber;
    private String color;
    private String icon;
    private LocalDateTime createdAt;
}