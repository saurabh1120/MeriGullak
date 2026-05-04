package com.MeiGullak.SavingApp.dto;

import com.MeiGullak.SavingApp.entity.Expense;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class BudgetRequest {

    @NotNull(message = "Category is required")
    private Expense.ExpenseCategory category;

    @NotNull(message = "Budget amount is required")
    @DecimalMin(value = "1.0", message = "Budget must be greater than 0")
    private BigDecimal budgetAmount;

    @NotNull(message = "Month is required")
    @Min(value = 1) @Max(value = 12)
    private int month;

    @NotNull(message = "Year is required")
    private int year;
}