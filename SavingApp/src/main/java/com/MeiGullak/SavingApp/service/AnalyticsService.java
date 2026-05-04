package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.entity.Expense;
import com.MeiGullak.SavingApp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ExpenseRepository expenseRepository;
    private final AccountRepository accountRepository;
    private final AuthHelper authHelper;
    private final GullakRepository gullakRepository;
    private final BudgetRepository budgetRepository;
    public AuthHelper getAuthHelper()
    {
        return authHelper;
    }

    private static final Map<String, String> CATEGORY_ICONS = Map.ofEntries(
            Map.entry("FOOD", "🍔"),
            Map.entry("SHOPPING", "🛍️"),
            Map.entry("TRAVEL", "✈️"),
            Map.entry("FUEL", "⛽"),
            Map.entry("BILLS", "📄"),
            Map.entry("ENTERTAINMENT", "🎬"),
            Map.entry("RENT", "🏠"),
            Map.entry("EMI", "🏦"),
            Map.entry("HEALTHCARE", "💊"),
            Map.entry("SALARY", "💰"),
            Map.entry("INVESTMENT", "📈"),
            Map.entry("OTHERS", "📦")
    );

    public AnalyticsResponse getAnalytics(int month, int year) {
        Long userId = authHelper.getCurrentUserId();

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Expense> expenses = expenseRepository
                .findByUserIdAndDateRange(userId, start, end);

        List<Expense> debits = expenses.stream()
                .filter(e -> e.getTransactionType() ==
                        Expense.TransactionType.DEBIT)
                .collect(Collectors.toList());

        List<Expense> credits = expenses.stream()
                .filter(e -> e.getTransactionType() ==
                        Expense.TransactionType.CREDIT)
                .collect(Collectors.toList());

        double totalExpense = debits.stream()
                .mapToDouble(e -> e.getAmount().doubleValue()).sum();

        double totalIncome = credits.stream()
                .mapToDouble(e -> e.getAmount().doubleValue()).sum();

        // Category breakdown
        Map<String, Double> categoryTotals = debits.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().name(),
                        Collectors.summingDouble(
                                e -> e.getAmount().doubleValue())));

        List<CategoryBreakdown> categoryBreakdown =
                categoryTotals.entrySet().stream()
                        .map(entry -> CategoryBreakdown.builder()
                                .category(entry.getKey())
                                .icon(CATEGORY_ICONS.getOrDefault(
                                        entry.getKey(), "📦"))
                                .amount(entry.getValue())
                                .percentage(totalExpense > 0
                                        ? Math.round((entry.getValue() /
                                        totalExpense * 100) * 10.0) / 10.0
                                        : 0)
                                .transactionCount((int) debits.stream()
                                        .filter(e -> e.getCategory().name()
                                                .equals(entry.getKey()))
                                        .count())
                                .build())
                        .sorted(Comparator.comparingDouble(
                                CategoryBreakdown::getAmount).reversed())
                        .collect(Collectors.toList());

        // Highest spending category
        String highestCategory = categoryBreakdown.isEmpty()
                ? "None"
                : categoryBreakdown.get(0).getCategory();

        // Monthly trend (last 6 months)
        Map<String, Double> monthlyTrend = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM");
        for (int i = 5; i >= 0; i--) {
            LocalDate m = LocalDate.now().minusMonths(i);
            LocalDate mStart = m.withDayOfMonth(1);
            LocalDate mEnd = m.withDayOfMonth(m.lengthOfMonth());
            double total = expenseRepository
                    .findByUserIdAndDateRange(userId, mStart, mEnd)
                    .stream()
                    .filter(e -> e.getTransactionType() ==
                            Expense.TransactionType.DEBIT)
                    .mapToDouble(e -> e.getAmount().doubleValue())
                    .sum();
            monthlyTrend.put(m.format(fmt), total);
        }

        // Weekly trend (last 7 days)
        Map<String, Double> weeklyTrend = new LinkedHashMap<>();
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("EEE");
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            double total = expenseRepository
                    .findByUserIdAndDateRange(userId, day, day)
                    .stream()
                    .filter(e -> e.getTransactionType() ==
                            Expense.TransactionType.DEBIT)
                    .mapToDouble(e -> e.getAmount().doubleValue())
                    .sum();
            weeklyTrend.put(day.format(dayFmt), total);
        }

        // Account-wise spending
        Map<String, Double> accountWiseSpending = new LinkedHashMap<>();
        accountRepository.findByUserIdAndActiveTrue(userId)
                .forEach(account -> {
                    double spent = debits.stream()
                            .filter(e -> e.getAccount().getId()
                                    .equals(account.getId()))
                            .mapToDouble(e -> e.getAmount().doubleValue())
                            .sum();
                    if (spent > 0) {
                        accountWiseSpending.put(
                                account.getAccountName(), spent);
                    }
                });

        String mostUsedAccount = accountWiseSpending.entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");

        double savingsRate = totalIncome > 0
                ? Math.round(((totalIncome - totalExpense) /
                totalIncome * 100) * 10.0) / 10.0
                : 0;

        return AnalyticsResponse.builder()
                .categoryBreakdown(categoryBreakdown)
                .monthlyTrend(monthlyTrend)
                .weeklyTrend(weeklyTrend)
                .accountWiseSpending(accountWiseSpending)
                .totalExpenseThisMonth(totalExpense)
                .totalIncomeThisMonth(totalIncome)
                .savingsRate(savingsRate)
                .highestSpendingCategory(highestCategory)
                .mostUsedAccount(mostUsedAccount)
                .build();
    }

    public List<SmartSuggestion> generateSuggestions(
            Long userId,
            BigDecimal monthlyExpense,
            BigDecimal monthlyIncome,
            BigDecimal totalSavings,
            List<Expense> expenses
    ) {
        List<SmartSuggestion> suggestions = new ArrayList<>();

        // Suggestion 1 - savings rate
        double expense = monthlyExpense.doubleValue();
        double income = monthlyIncome.doubleValue();

        if (income > 0 && expense > income * 0.8) {
            suggestions.add(SmartSuggestion.builder()
                    .type("WARNING")
                    .icon("⚠️")
                    .title("High Spending Alert")
                    .message("You've spent more than 80% of your income this month. Try to cut down on non-essential expenses.")
                    .color("#e8632a")
                    .build());
        }

        // Suggestion 2 - top category
        Map<String, Double> catTotals = expenses.stream()
                .filter(e -> e.getTransactionType() ==
                        Expense.TransactionType.DEBIT)
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().name(),
                        Collectors.summingDouble(
                                e -> e.getAmount().doubleValue())));

        catTotals.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresent(top -> {
                    suggestions.add(SmartSuggestion.builder()
                            .type("INFO")
                            .icon("📊")
                            .title("Top Spending Category")
                            .message("Most of your expenses are in " +
                                    top.getKey().toLowerCase() +
                                    " (₹" + String.format("%.0f",
                                    top.getValue()) + "). Consider setting a budget for this category.")
                            .color("#c44b8a")
                            .build());
                });

        // Suggestion 3 - savings tip
        if (income > 0) {
            double dailySaving = (income - expense) / 30;
            if (dailySaving > 0) {
                suggestions.add(SmartSuggestion.builder()
                        .type("TIP")
                        .icon("💡")
                        .title("Daily Savings Tip")
                        .message("You can save ₹" +
                                String.format("%.0f", dailySaving) +
                                " daily based on your current income and expenses.")
                        .color("#3ecf8e")
                        .build());
            }
        }

        // Suggestion 4 - gullak tip
        if (totalSavings.compareTo(BigDecimal.ZERO) == 0) {
            suggestions.add(SmartSuggestion.builder()
                    .type("MOTIVATION")
                    .icon("🪙")
                    .title("Start Your First Gullak!")
                    .message("You haven't started saving for any goal yet. Create your first Gullak and start your savings journey!")
                    .color("#7c3aed")
                    .build());
        }

        // Suggestion 5 - general tip
        suggestions.add(SmartSuggestion.builder()
                .type("TIP")
                .icon("🎯")
                .title("50-30-20 Rule")
                .message("Try the 50-30-20 rule: 50% for needs, 30% for wants, and 20% for savings. It's the simplest way to manage money!")
                .color("#2d3a8c")
                .build());

        return suggestions;
    }

    public int calculateHealthScore(Long userId) {
        LocalDate now = LocalDate.now();
        LocalDate start = now.withDayOfMonth(1);
        LocalDate end = now.withDayOfMonth(now.lengthOfMonth());

        List<Expense> expenses = expenseRepository
                .findByUserIdAndDateRange(userId, start, end);

        double income = expenses.stream()
                .filter(e -> e.getTransactionType() ==
                        Expense.TransactionType.CREDIT)
                .mapToDouble(e -> e.getAmount().doubleValue()).sum();

        double expense = expenses.stream()
                .filter(e -> e.getTransactionType() ==
                        Expense.TransactionType.DEBIT)
                .mapToDouble(e -> e.getAmount().doubleValue()).sum();

        int score = 50; // base score

        // Savings rate (max 30 points)
        if (income > 0) {
            double savingsRate = (income - expense) / income * 100;
            if (savingsRate >= 20) score += 30;
            else if (savingsRate >= 10) score += 20;
            else if (savingsRate >= 0) score += 10;
            else score -= 10;
        }

        // Has active gullaks (max 10 points)
        long activeGullaks = gullakRepository
                .findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId)
                .stream()
                .filter(g -> g.getStatus() ==
                        com.MeiGullak.SavingApp.entity.Gullak.GullakStatus.ACTIVE)
                .count();
        if (activeGullaks > 0) score += 10;

        // Has budgets (max 10 points)
        long budgets = budgetRepository
                .findByUserIdAndMonthAndYearAndActiveTrue(
                        userId, now.getMonthValue(), now.getYear())
                .size();
        if (budgets > 0) score += 10;

        return Math.min(100, Math.max(0, score));
    }

}