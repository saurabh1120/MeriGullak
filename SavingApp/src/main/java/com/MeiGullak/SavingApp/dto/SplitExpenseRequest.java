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

    private SplitExpense.SplitType splitType
            = SplitExpense.SplitType.EQUAL;

    private Map<Long, BigDecimal> customShares;

    private LocalDate expenseDate;
}