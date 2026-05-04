package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.entity.*;
import com.MeiGullak.SavingApp.exception.CustomException;
import com.MeiGullak.SavingApp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import com.MeiGullak.SavingApp.service.*;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final AccountRepository accountRepository;
    private final AuthHelper authHelper;

    @Transactional
    public ExpenseResponse addExpense(ExpenseRequest request) {
        User user = authHelper.getCurrentUser();

        Account account = accountRepository
                .findByIdAndUserId(request.getAccountId(), user.getId())
                .orElseThrow(() -> new CustomException(
                        "Account not found", HttpStatus.NOT_FOUND));

        // Update account balance
        if (request.getTransactionType() == Expense.TransactionType.DEBIT) {
            if (account.getBalance().compareTo(request.getAmount()) < 0) {
                throw new CustomException(
                        "Insufficient balance", HttpStatus.BAD_REQUEST);
            }
            account.setBalance(account.getBalance().subtract(request.getAmount()));
            account.setTotalExpense(account.getTotalExpense().add(request.getAmount()));
        } else {
            account.setBalance(account.getBalance().add(request.getAmount()));
            account.setTotalIncome(account.getTotalIncome().add(request.getAmount()));
        }
        accountRepository.save(account);

        Expense expense = Expense.builder()
                .user(user)
                .account(account)
                .amount(request.getAmount())
                .category(request.getCategory())
                .expenseDate(request.getExpenseDate())
                .description(request.getDescription())
                .merchant(request.getMerchant())
                .transactionType(request.getTransactionType())
                .build();

        return mapToResponse(expenseRepository.save(expense));
    }

    public List<ExpenseResponse> getAllExpenses() {
        Long userId = authHelper.getCurrentUserId();
        return expenseRepository
                .findByUserIdOrderByExpenseDateDescCreatedAtDesc(userId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByAccount(Long accountId) {
        Long userId = authHelper.getCurrentUserId();
        return expenseRepository
                .findByUserIdAndAccountIdOrderByExpenseDateDesc(userId, accountId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByDateRange(
            LocalDate start, LocalDate end
    ) {
        Long userId = authHelper.getCurrentUserId();
        return expenseRepository
                .findByUserIdAndDateRange(userId, start, end)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteExpense(Long id) {
        Long userId = authHelper.getCurrentUserId();
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomException(
                        "Expense not found", HttpStatus.NOT_FOUND));

        // Reverse account balance
        Account account = expense.getAccount();
        if (expense.getTransactionType() == Expense.TransactionType.DEBIT) {
            account.setBalance(account.getBalance().add(expense.getAmount()));
            account.setTotalExpense(account.getTotalExpense().subtract(expense.getAmount()));
        } else {
            account.setBalance(account.getBalance().subtract(expense.getAmount()));
            account.setTotalIncome(account.getTotalIncome().subtract(expense.getAmount()));
        }
        accountRepository.save(account);
        expenseRepository.delete(expense);
    }

    public ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .accountId(expense.getAccount().getId())
                .accountName(expense.getAccount().getAccountName())
                .accountType(expense.getAccount().getAccountType().name())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .expenseDate(expense.getExpenseDate())
                .description(expense.getDescription())
                .merchant(expense.getMerchant())
                .transactionType(expense.getTransactionType())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}