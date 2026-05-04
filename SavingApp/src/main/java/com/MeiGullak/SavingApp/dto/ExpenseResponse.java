package com.MeiGullak.SavingApp.dto;

import com.MeiGullak.SavingApp.entity.Expense;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExpenseResponse {
    private Long id;
    private Long accountId;
    private String accountName;
    private String accountType;
    private BigDecimal amount;
    private Expense.ExpenseCategory category;
    private LocalDate expenseDate;
    private String description;
    private String merchant;
    private Expense.TransactionType transactionType;
    private LocalDateTime createdAt;
}