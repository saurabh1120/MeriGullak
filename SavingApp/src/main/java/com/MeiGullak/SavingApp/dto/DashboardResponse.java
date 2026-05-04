package com.MeiGullak.SavingApp.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DashboardResponse {
    private BigDecimal totalBalance;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpense;
    private BigDecimal totalSavings;
    private int activeGoals;
    private int completedGoals;
    private int totalAccounts;
    private BigDecimal netSavings;
    private List<ExpenseResponse> recentTransactions;
    private List<GullakResponse> topGullaks;
    private List<BudgetResponse> budgetAlerts;
    private List<SmartSuggestion> suggestions;
    private GamificationResponse gamification;
}