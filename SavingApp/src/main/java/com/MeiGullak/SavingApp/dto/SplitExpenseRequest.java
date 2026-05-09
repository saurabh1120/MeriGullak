package com.MeiGullak.SavingApp.dto;

import com.MeiGullak.SavingApp.entity.SplitExpense;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class SplitExpenseRequest {

    @NotNull(message = "Group is required")
    private Long groupId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01")
    private BigDecimal totalAmount;

    @NotNull(message = "Paid by is required")
    private Long paidById;

    // EQUAL, CUSTOM, or SHARES — defaults to EQUAL
    private SplitExpense.SplitType splitType
        = SplitExpense.SplitType.EQUAL;

    // For CUSTOM split: userId -> exact amount
    // e.g. { 1: 1200.00, 2: 800.00 }
    private Map<Long, BigDecimal> customShares;

    // For SHARES split: userId -> number of shares
    // e.g. { 1: 2, 2: 1 } means user1 pays 2/3, user2 pays 1/3
    private Map<Long, Integer> memberShares;

    private LocalDate expenseDate;
}
