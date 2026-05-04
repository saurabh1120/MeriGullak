package com.MeiGullak.SavingApp.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class GullakRequest {

    @NotBlank(message = "Goal name is required")
    private String goalName;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "1.0", message = "Target must be greater than 0")
    private BigDecimal targetAmount;

    private LocalDate targetDate;
    private String icon;
    private String color;
    private String description;
}