package com.MeiGullak.SavingApp.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CategoryBreakdown {
    private String category;
    private String icon;
    private double amount;
    private double percentage;
    private int transactionCount;
}