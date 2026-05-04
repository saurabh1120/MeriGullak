package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.entity.Expense;
import com.MeiGullak.SavingApp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AccountRepository accountRepository;
    private final ExpenseRepository expenseRepository;
    private final GullakRepository gullakRepository;
    private final BudgetRepository budgetRepository;
    private final AuthHelper authHelper;
    private final AccountService accountService;
    private final ExpenseService expenseService;
    private final GullakService gullakService;
    private final BudgetService budgetService;
    private final AnalyticsService analyticsService;
    private final GamificationService gamificationService;

    public DashboardResponse getDashboard() {
        Long userId = authHelper.getCurrentUserId();
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        // Total balance
        BigDecimal totalBalance = accountRepository
                .getTotalBalanceByUserId(userId);

        // Monthly income & expense
        List<com.MeiGullak.SavingApp.entity.Expense> monthlyExpenses =
                expenseRepository.findByUserIdAndDateRange(
                        userId, startOfMonth, endOfMonth);

        BigDecimal monthlyIncome = monthlyExpenses.stream()
                .filter(e -> e.getTransactionType() ==
                        Expense.TransactionType.CREDIT)
                .map(com.MeiGullak.SavingApp.entity.Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal monthlyExpense = monthlyExpenses.stream()
                .filter(e -> e.getTransactionType() ==
                        Expense.TransactionType.DEBIT)
                .map(com.MeiGullak.SavingApp.entity.Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Gullak stats
        var gullaks = gullakRepository
                .findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId);

        BigDecimal totalSavings = gullaks.stream()
                .map(g -> g.getSavedAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeGoals = gullaks.stream()
                .filter(g -> g.getStatus() ==
                        com.MeiGullak.SavingApp.entity.Gullak.GullakStatus.ACTIVE)
                .count();

        long completedGoals = gullaks.stream()
                .filter(g -> g.getStatus() ==
                        com.MeiGullak.SavingApp.entity.Gullak.GullakStatus.COMPLETED)
                .count();

        // Recent transactions (last 10)
        List<ExpenseResponse> recentTransactions =
                expenseRepository
                        .findByUserIdOrderByExpenseDateDescCreatedAtDesc(userId)
                        .stream().limit(10)
                        .map(expenseService::mapToResponse)
                        .collect(Collectors.toList());

        // Top gullaks (top 3)
        List<GullakResponse> topGullaks = gullaks.stream()
                .limit(3)
                .map(gullakService::mapToResponse)
                .collect(Collectors.toList());

        // Budget alerts
        List<BudgetResponse> budgetAlerts = budgetRepository
                .findByUserIdAndMonthAndYearAndActiveTrue(
                        userId, now.getMonthValue(), now.getYear())
                .stream()
                .map(budgetService::mapToResponse)
                .filter(b -> b.isNearLimit() || b.isOverBudget())
                .collect(Collectors.toList());

        // Smart suggestions
        List<SmartSuggestion> suggestions =
                analyticsService.generateSuggestions(
                        userId, monthlyExpense, monthlyIncome,
                        totalSavings, monthlyExpenses);

        // Gamification
        GamificationResponse gamification =
                gamificationService.getGamification(userId);

        // Accounts count
        int totalAccounts = accountRepository
                .findByUserIdAndActiveTrue(userId).size();

        return DashboardResponse.builder()
                .totalBalance(totalBalance)
                .monthlyIncome(monthlyIncome)
                .monthlyExpense(monthlyExpense)
                .totalSavings(totalSavings)
                .activeGoals((int) activeGoals)
                .completedGoals((int) completedGoals)
                .totalAccounts(totalAccounts)
                .netSavings(monthlyIncome.subtract(monthlyExpense))
                .recentTransactions(recentTransactions)
                .topGullaks(topGullaks)
                .budgetAlerts(budgetAlerts)
                .suggestions(suggestions)
                .gamification(gamification)
                .build();
    }
}