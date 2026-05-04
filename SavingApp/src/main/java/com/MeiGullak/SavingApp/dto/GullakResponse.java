package com.MeiGullak.SavingApp.dto;

import com.MeiGullak.SavingApp.entity.Gullak;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GullakResponse {
    private Long id;
    private String goalName;
    private String icon;
    private String color;
    private String description;
    private BigDecimal targetAmount;
    private BigDecimal savedAmount;
    private BigDecimal remainingAmount;
    private double progressPercentage;
    private LocalDate targetDate;
    private Gullak.GullakStatus status;
    private LocalDateTime createdAt;
}