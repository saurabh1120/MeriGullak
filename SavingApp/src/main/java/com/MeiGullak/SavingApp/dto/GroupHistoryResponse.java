package com.MeiGullak.SavingApp.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GroupHistoryResponse {

    private Long id;

    // Type: "EXPENSE" or "SETTLEMENT"
    private String type;

    // For expense: title, splitType
    // For settlement: "Cash Payment"
    private String title;
    private String description;

    // Who was involved
    private String fromName;  // who paid / who gave cash
    private String toName;    // who received (for settlement)

    private BigDecimal amount;
    private String splitType; // EQUAL/CUSTOM/SHARES (for expense)
    private LocalDateTime createdAt;

    // For display
    private String icon;   // emoji icon
    private String color;  // hex color for display
}
