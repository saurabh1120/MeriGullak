package com.MeiGullak.SavingApp.controller;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.entity.Expense;
import com.MeiGullak.SavingApp.service.ExpenseService;
import com.MeiGullak.SavingApp.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final FileStorageService fileStorageService;

    // ── Existing endpoints ──────────────────────────

    @PostMapping
    public ResponseEntity<ExpenseResponse> add(
            @Valid @RequestBody ExpenseRequest request
    ) {
        return ResponseEntity.ok(expenseService.addExpense(request));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAll() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<ExpenseResponse>> getByAccount(
            @PathVariable Long accountId
    ) {
        return ResponseEntity.ok(
                expenseService.getExpensesByAccount(accountId));
    }

    @GetMapping("/range")
    public ResponseEntity<List<ExpenseResponse>> getByDateRange(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return ResponseEntity.ok(
                expenseService.getExpensesByDateRange(start, end));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok("Expense deleted successfully");
    }

    // ── NEW endpoint with receipt ───────────────────

    @PostMapping("/with-receipt")
    public ResponseEntity<ExpenseResponse> addWithReceipt(
            @RequestParam("accountId") Long accountId,
            @RequestParam("amount") BigDecimal amount,
            @RequestParam("category") Expense.ExpenseCategory category,
            @RequestParam("expenseDate") String expenseDate,
            @RequestParam(value = "description", required = false)
            String description,
            @RequestParam(value = "merchant", required = false)
            String merchant,
            @RequestParam(value = "transactionType", defaultValue = "DEBIT")
            Expense.TransactionType transactionType,
            @RequestParam(value = "file", required = false)
            MultipartFile file
    ) {
        String receiptUrl = null;
        if (file != null && !file.isEmpty()) {
            receiptUrl = fileStorageService.saveFile(file, "receipts");
        }

        ExpenseRequest request = new ExpenseRequest();
        request.setAccountId(accountId);
        request.setAmount(amount);
        request.setCategory(category);
        request.setExpenseDate(LocalDate.parse(expenseDate));
        request.setDescription(description);
        request.setMerchant(merchant);
        request.setTransactionType(transactionType);
        request.setReceiptUrl(receiptUrl);

        return ResponseEntity.ok(expenseService.addExpense(request));
    }
}