package com.MeiGullak.SavingApp.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SplitGroupResponse {
    private Long id;
    private String name;
    private String icon;
    private String color;
    private String description;
    private String createdByName;
    private List<FriendResponse> members;
    private int totalExpenses;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
}