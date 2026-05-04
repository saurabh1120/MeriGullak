package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.TransferRequest;
import com.MeiGullak.SavingApp.entity.*;
import com.MeiGullak.SavingApp.exception.CustomException;
import com.MeiGullak.SavingApp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferRepository transferRepository;
    private final AccountRepository accountRepository;
    private final AuthHelper authHelper;

    @Transactional
    public String transfer(TransferRequest request) {
        User user = authHelper.getCurrentUser();
        Long userId = user.getId();

        if (request.getFromAccountId().equals(request.getToAccountId())) {
            throw new CustomException(
                    "Cannot transfer to same account", HttpStatus.BAD_REQUEST);
        }

        Account from = accountRepository
                .findByIdAndUserId(request.getFromAccountId(), userId)
                .orElseThrow(() -> new CustomException(
                        "Source account not found", HttpStatus.NOT_FOUND));

        Account to = accountRepository
                .findByIdAndUserId(request.getToAccountId(), userId)
                .orElseThrow(() -> new CustomException(
                        "Destination account not found", HttpStatus.NOT_FOUND));

        if (from.getBalance().compareTo(request.getAmount()) < 0) {
            throw new CustomException(
                    "Insufficient balance in source account", HttpStatus.BAD_REQUEST);
        }

        from.setBalance(from.getBalance().subtract(request.getAmount()));
        from.setTotalExpense(from.getTotalExpense().add(request.getAmount()));

        to.setBalance(to.getBalance().add(request.getAmount()));
        to.setTotalIncome(to.getTotalIncome().add(request.getAmount()));

        accountRepository.save(from);
        accountRepository.save(to);

        Transfer transfer = Transfer.builder()
                .user(user)
                .fromAccount(from)
                .toAccount(to)
                .amount(request.getAmount())
                .note(request.getNote())
                .transferDate(request.getTransferDate() != null
                        ? request.getTransferDate() : LocalDate.now())
                .build();

        transferRepository.save(transfer);
        return "Transfer successful! ₹" + request.getAmount() + " moved successfully.";
    }

    public List<Transfer> getAllTransfers() {
        Long userId = authHelper.getCurrentUserId();
        return transferRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}