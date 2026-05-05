package com.MeiGullak.SavingApp.dto;

import com.MeiGullak.SavingApp.entity.Expense;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class ExpenseRequest {

    @NotNull(message = "Account is required")
    private Long accountId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Category is required")
    private Expense.ExpenseCategory category;

    @NotNull(message = "Date is required")
    private LocalDate expenseDate;

    private String description;
    private String merchant;
    private Expense.TransactionType transactionType = Expense.TransactionType.DEBIT;
    private String receiptUrl;
}