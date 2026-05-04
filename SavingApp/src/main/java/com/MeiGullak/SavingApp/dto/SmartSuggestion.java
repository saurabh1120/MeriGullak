package com.MeiGullak.SavingApp.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SmartSuggestion {
    private String type;
    private String icon;
    private String title;
    private String message;
    private String color;
}