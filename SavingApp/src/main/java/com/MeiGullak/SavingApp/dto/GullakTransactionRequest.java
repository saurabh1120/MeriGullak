package com.MeiGullak.SavingApp.dto;

import com.MeiGullak.SavingApp.entity.GullakTransaction;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class GullakTransactionRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required")
    private GullakTransaction.TransactionType type;

    private String note;
}