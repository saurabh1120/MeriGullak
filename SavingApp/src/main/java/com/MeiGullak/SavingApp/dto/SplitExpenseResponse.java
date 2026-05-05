package com.MeiGullak.SavingApp.dto;

import com.MeiGullak.SavingApp.entity.SplitExpense;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SplitExpenseResponse {
    private Long id;
    private Long groupId;
    private String groupName;
    private String title;
    private String description;
    private BigDecimal totalAmount;
    private String paidByName;
    private Long paidById;
    private SplitExpense.SplitType splitType;
    private LocalDate expenseDate;
    private String receiptUrl;
    private List<ShareDetail> shares;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class ShareDetail {
        private Long userId;
        private String userName;
        private BigDecimal shareAmount;
        private boolean settled;
    }
}