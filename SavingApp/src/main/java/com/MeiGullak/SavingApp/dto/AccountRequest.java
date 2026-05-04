package com.MeiGullak.SavingApp.dto;

import com.MeiGullak.SavingApp.entity.Account;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class AccountRequest {

    @NotBlank(message = "Account name is required")
    private String accountName;

    @NotNull(message = "Account type is required")
    private Account.AccountType accountType;

    @NotNull(message = "Opening balance is required")
    @DecimalMin(value = "0.0", message = "Balance cannot be negative")
    private BigDecimal balance;

    private String bankName;
    private String accountNumber;
    private String color;
    private String icon;
}