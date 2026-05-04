package com.MeiGullak.SavingApp.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class TransferRequest {

    @NotNull(message = "From account is required")
    private Long fromAccountId;

    @NotNull(message = "To account is required")
    private Long toAccountId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    private String note;
    private LocalDate transferDate;
}