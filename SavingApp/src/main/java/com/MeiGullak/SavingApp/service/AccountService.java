package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.entity.*;
import com.MeiGullak.SavingApp.exception.CustomException;
import com.MeiGullak.SavingApp.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final AuthHelper authHelper;

    public AccountResponse createAccount(AccountRequest request) {
        User user = authHelper.getCurrentUser();

        Account account = Account.builder()
                .user(user)
                .accountName(request.getAccountName())
                .accountType(request.getAccountType())
                .balance(request.getBalance())
                .totalIncome(request.getBalance())
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .color(request.getColor())
                .icon(request.getIcon())
                .build();

        return mapToResponse(accountRepository.save(account));
    }

    public List<AccountResponse> getAllAccounts() {
        Long userId = authHelper.getCurrentUserId();
        return accountRepository.findByUserIdAndActiveTrue(userId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AccountResponse getAccountById(Long id) {
        Long userId = authHelper.getCurrentUserId();
        Account account = accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomException(
                        "Account not found", HttpStatus.NOT_FOUND));
        return mapToResponse(account);
    }

    public AccountResponse updateAccount(Long id, AccountRequest request) {
        Long userId = authHelper.getCurrentUserId();
        Account account = accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomException(
                        "Account not found", HttpStatus.NOT_FOUND));

        account.setAccountName(request.getAccountName());
        account.setAccountType(request.getAccountType());
        account.setBankName(request.getBankName());
        account.setAccountNumber(request.getAccountNumber());
        account.setColor(request.getColor());
        account.setIcon(request.getIcon());

        return mapToResponse(accountRepository.save(account));
    }

    public void deleteAccount(Long id) {
        Long userId = authHelper.getCurrentUserId();
        Account account = accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomException(
                        "Account not found", HttpStatus.NOT_FOUND));
        account.setActive(false);
        accountRepository.save(account);
    }

    public BigDecimal getTotalBalance() {
        Long userId = authHelper.getCurrentUserId();
        return accountRepository.getTotalBalanceByUserId(userId);
    }

    public AccountResponse mapToResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountName(account.getAccountName())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .totalIncome(account.getTotalIncome())
                .totalExpense(account.getTotalExpense())
                .bankName(account.getBankName())
                .accountNumber(account.getAccountNumber())
                .color(account.getColor())
                .icon(account.getIcon())
                .createdAt(account.getCreatedAt())
                .build();
    }
}