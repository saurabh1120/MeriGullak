package com.MeiGullak.SavingApp.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AnalyticsResponse {
    private List<CategoryBreakdown> categoryBreakdown;
    private Map<String, Double> monthlyTrend;
    private Map<String, Double> weeklyTrend;
    private Map<String, Double> accountWiseSpending;
    private double totalExpenseThisMonth;
    private double totalIncomeThisMonth;
    private double savingsRate;
    private String highestSpendingCategory;
    private String mostUsedAccount;
}