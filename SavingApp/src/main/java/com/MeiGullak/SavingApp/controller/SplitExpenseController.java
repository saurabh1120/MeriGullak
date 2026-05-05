package com.MeiGullak.SavingApp.controller;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.service.SplitExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/split")
@RequiredArgsConstructor
public class SplitExpenseController {

    private final SplitExpenseService expenseService;

    @PostMapping("/expenses")
    public ResponseEntity<SplitExpenseResponse> addExpense(
            @Valid @RequestBody SplitExpenseRequest request
    ) {
        return ResponseEntity.ok(expenseService.addExpense(request));
    }

    @GetMapping("/groups/{groupId}/expenses")
    public ResponseEntity<List<SplitExpenseResponse>> getGroupExpenses(
            @PathVariable Long groupId
    ) {
        return ResponseEntity.ok(
                expenseService.getGroupExpenses(groupId));
    }

    @GetMapping("/groups/{groupId}/balances")
    public ResponseEntity<BalanceSummary> getBalances(
            @PathVariable Long groupId
    ) {
        return ResponseEntity.ok(
                expenseService.getGroupBalances(groupId));
    }

    @PostMapping("/groups/{groupId}/settle/{userId}")
    public ResponseEntity<String> settleUp(
            @PathVariable Long groupId,
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
                expenseService.settleUp(groupId, userId));
    }
}