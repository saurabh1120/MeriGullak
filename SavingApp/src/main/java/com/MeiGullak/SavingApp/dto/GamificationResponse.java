package com.MeiGullak.SavingApp.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GamificationResponse {
    private int currentStreak;
    private int longestStreak;
    private int totalPoints;
    private int level;
    private String levelName;
    private int pointsToNextLevel;
    private List<Badge> badges;
    private int noSpendDays;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class Badge {
        private String name;
        private String icon;
        private String description;
        private boolean unlocked;
    }
}