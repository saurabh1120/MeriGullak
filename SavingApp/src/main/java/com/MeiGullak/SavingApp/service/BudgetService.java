package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.entity.*;
import com.MeiGullak.SavingApp.exception.CustomException;
import com.MeiGullak.SavingApp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final AuthHelper authHelper;

    public BudgetResponse createBudget(BudgetRequest request) {
        User user = authHelper.getCurrentUser();

        // Check if budget already exists for this category/month/year
        budgetRepository.findByUserIdAndCategoryAndMonthAndYear(
                user.getId(), request.getCategory(),
                request.getMonth(), request.getYear()
        ).ifPresent(b -> {
            throw new CustomException(
                    "Budget already exists for this category and month",
                    HttpStatus.CONFLICT
            );
        });

        Budget budget = Budget.builder()
                .user(user)
                .category(request.getCategory())
                .budgetAmount(request.getBudgetAmount())
                .month(request.getMonth())
                .year(request.getYear())
                .build();

        // Calculate already spent amount
        LocalDate start = LocalDate.of(
                request.getYear(), request.getMonth(), 1);
        LocalDate end = start.withDayOfMonth(
                start.lengthOfMonth());

        BigDecimal spent = calculateSpent(
                user.getId(), request.getCategory(), start, end);
        budget.setSpentAmount(spent);

        return mapToResponse(budgetRepository.save(budget));
    }

    public List<BudgetResponse> getBudgetsByMonth(int month, int year) {
        Long userId = authHelper.getCurrentUserId();
        return budgetRepository
                .findByUserIdAndMonthAndYearAndActiveTrue(userId, month, year)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BudgetResponse> getAllBudgets() {
        Long userId = authHelper.getCurrentUserId();
        return budgetRepository.findAllActiveByUserId(userId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BudgetResponse updateBudget(Long id, BudgetRequest request) {
        Long userId = authHelper.getCurrentUserId();
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomException(
                        "Budget not found", HttpStatus.NOT_FOUND));

        budget.setBudgetAmount(request.getBudgetAmount());
        return mapToResponse(budgetRepository.save(budget));
    }

    public void deleteBudget(Long id) {
        Long userId = authHelper.getCurrentUserId();
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomException(
                        "Budget not found", HttpStatus.NOT_FOUND));
        budget.setActive(false);
        budgetRepository.save(budget);
    }

    public void updateSpentAmounts(
            Long userId,
            Expense.ExpenseCategory category,
            int month, int year
    ) {
        budgetRepository.findByUserIdAndCategoryAndMonthAndYear(
                userId, category, month, year
        ).ifPresent(budget -> {
            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.withDayOfMonth(
                    start.lengthOfMonth());
            BigDecimal spent = calculateSpent(
                    userId, category, start, end);
            budget.setSpentAmount(spent);
            budgetRepository.save(budget);
        });
    }

    private BigDecimal calculateSpent(
            Long userId,
            Expense.ExpenseCategory category,
            LocalDate start, LocalDate end
    ) {
        return expenseRepository
                .findByUserIdAndDateRange(userId, start, end)
                .stream()
                .filter(e -> e.getCategory() == category
                        && e.getTransactionType()
                        == Expense.TransactionType.DEBIT)
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BudgetResponse mapToResponse(Budget budget) {
        BigDecimal remaining = budget.getBudgetAmount()
                .subtract(budget.getSpentAmount());

        String alertMessage = null;
        if (budget.isOverBudget()) {
            alertMessage = "⚠️ Over budget! You exceeded your "
                    + budget.getCategory().name().toLowerCase()
                    + " budget!";
        } else if (budget.isNearLimit()) {
            alertMessage = "🔔 You have used "
                    + String.format("%.0f", budget.getUsagePercentage())
                    + "% of your "
                    + budget.getCategory().name().toLowerCase()
                    + " budget!";
        }

        return BudgetResponse.builder()
                .id(budget.getId())
                .category(budget.getCategory())
                .budgetAmount(budget.getBudgetAmount())
                .spentAmount(budget.getSpentAmount())
                .remainingAmount(remaining.compareTo(BigDecimal.ZERO) < 0
                        ? BigDecimal.ZERO : remaining)
                .usagePercentage(budget.getUsagePercentage())
                .overBudget(budget.isOverBudget())
                .nearLimit(budget.isNearLimit())
                .month(budget.getMonth())
                .year(budget.getYear())
                .alertMessage(alertMessage)
                .build();
    }
}