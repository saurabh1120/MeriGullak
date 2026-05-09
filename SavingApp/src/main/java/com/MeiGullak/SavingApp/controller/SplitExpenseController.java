package com.MeiGullak.SavingApp.controller;
import com.MeiGullak.SavingApp.dto.GroupHistoryResponse;
import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.service.SplitExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/split")
@RequiredArgsConstructor
public class SplitExpenseController {

    private final SplitExpenseService expenseService;

    // Add expense
    @PostMapping("/expenses")
    public ResponseEntity<SplitExpenseResponse> addExpense(
        @Valid @RequestBody SplitExpenseRequest request
    ) {
        return ResponseEntity.ok(
            expenseService.addExpense(request));
    }

    // Edit expense
    @PutMapping("/expenses/{id}")
    public ResponseEntity<SplitExpenseResponse> updateExpense(
        @PathVariable Long id,
        @Valid @RequestBody SplitExpenseRequest request
    ) {
        return ResponseEntity.ok(
            expenseService.updateExpense(id, request));
    }

    // Delete expense
    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<String> deleteExpense(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(
            expenseService.deleteExpense(id));
    }

    // Get group expenses
    @GetMapping("/groups/{groupId}/expenses")
    public ResponseEntity<List<SplitExpenseResponse>> getGroupExpenses(
        @PathVariable Long groupId
    ) {
        return ResponseEntity.ok(
            expenseService.getGroupExpenses(groupId));
    }

    // Get balances
    @GetMapping("/groups/{groupId}/balances")
    public ResponseEntity<BalanceSummary> getBalances(
        @PathVariable Long groupId
    ) {
        return ResponseEntity.ok(
            expenseService.getGroupBalances(groupId));
    }

    // Full settle up
    @PostMapping("/groups/{groupId}/settle/{userId}")
    public ResponseEntity<String> settleUp(
        @PathVariable Long groupId,
        @PathVariable Long userId
    ) {
        return ResponseEntity.ok(
            expenseService.settleUp(groupId, userId));
    }

    // ✅ NEW — Partial settle up with custom amount
    @PostMapping("/groups/{groupId}/settle/{userId}/partial")
    public ResponseEntity<BalanceSummary> partialSettle(
        @PathVariable Long groupId,
        @PathVariable Long userId,
        @RequestParam BigDecimal amount
    ) {
        return ResponseEntity.ok(
            expenseService.partialSettle(groupId, userId, amount));
    }

    // Get group history — expenses + cash payments
    @GetMapping("/groups/{groupId}/history")
    public ResponseEntity<List<GroupHistoryResponse>> getGroupHistory(
            @PathVariable Long groupId
    ) {
        return ResponseEntity.ok(
                expenseService.getGroupHistory(groupId));
    }
}
