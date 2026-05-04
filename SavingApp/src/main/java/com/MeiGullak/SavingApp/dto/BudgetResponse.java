package com.MeiGullak.SavingApp.dto;

import com.MeiGullak.SavingApp.entity.Budget;
import com.MeiGullak.SavingApp.entity.Expense;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BudgetResponse {
    private Long id;
    private Expense.ExpenseCategory category;
    private BigDecimal budgetAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private double usagePercentage;
    private boolean overBudget;
    private boolean nearLimit;
    private int month;
    private int year;
    private String alertMessage;
}