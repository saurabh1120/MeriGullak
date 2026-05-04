package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.GamificationResponse;
import com.MeiGullak.SavingApp.entity.Expense;
import com.MeiGullak.SavingApp.entity.Gullak;
import com.MeiGullak.SavingApp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final ExpenseRepository expenseRepository;
    private final GullakRepository gullakRepository;

    public GamificationResponse getGamification(Long userId) {
        List<GamificationResponse.Badge> badges = new ArrayList<>();

        // Get all expenses
        List<Expense> allExpenses = expenseRepository
                .findByUserIdOrderByExpenseDateDescCreatedAtDesc(userId);

        // Get all gullaks
        List<Gullak> allGullaks = gullakRepository
                .findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId);

        double totalSaved = allGullaks.stream()
                .mapToDouble(g -> g.getSavedAmount().doubleValue())
                .sum();

        long completedGoals = allGullaks.stream()
                .filter(g -> g.getStatus() == Gullak.GullakStatus.COMPLETED)
                .count();

        // Calculate streak
        int streak = calculateStreak(allExpenses);

        // Calculate no-spend days this month
        int noSpendDays = calculateNoSpendDays(userId, allExpenses);

        // Calculate points
        int points = (streak * 10)
                + (allExpenses.size() * 2)
                + ((int) (totalSaved / 100))
                + ((int) completedGoals * 50)
                + (noSpendDays * 5);

        // Level system
        int level = Math.min(10, (points / 100) + 1);
        String levelName = getLevelName(level);
        int pointsToNextLevel = (level * 100) - points;

        // Badges
        badges.add(GamificationResponse.Badge.builder()
                .name("First Step")
                .icon("👣")
                .description("Add your first transaction")
                .unlocked(!allExpenses.isEmpty())
                .build());

        badges.add(GamificationResponse.Badge.builder()
                .name("Saver")
                .icon("💰")
                .description("Save ₹1000 in any Gullak")
                .unlocked(totalSaved >= 1000)
                .build());

        badges.add(GamificationResponse.Badge.builder()
                .name("Week Warrior")
                .icon("🔥")
                .description("Maintain a 7-day tracking streak")
                .unlocked(streak >= 7)
                .build());

        badges.add(GamificationResponse.Badge.builder()
                .name("Goal Crusher")
                .icon("🏆")
                .description("Complete your first Gullak goal")
                .unlocked(completedGoals >= 1)
                .build());

        badges.add(GamificationResponse.Badge.builder()
                .name("Big Saver")
                .icon("💎")
                .description("Save ₹10,000 total")
                .unlocked(totalSaved >= 10000)
                .build());

        badges.add(GamificationResponse.Badge.builder()
                .name("No Spend Hero")
                .icon("🛡️")
                .description("Have 5 no-spend days this month")
                .unlocked(noSpendDays >= 5)
                .build());

        badges.add(GamificationResponse.Badge.builder()
                .name("Streak Master")
                .icon("⚡")
                .description("Maintain a 30-day tracking streak")
                .unlocked(streak >= 30)
                .build());

        badges.add(GamificationResponse.Badge.builder()
                .name("Multi Saver")
                .icon("🎯")
                .description("Complete 3 Gullak goals")
                .unlocked(completedGoals >= 3)
                .build());

        return GamificationResponse.builder()
                .currentStreak(streak)
                .longestStreak(streak)
                .totalPoints(points)
                .level(level)
                .levelName(levelName)
                .pointsToNextLevel(Math.max(0, pointsToNextLevel))
                .badges(badges)
                .noSpendDays(noSpendDays)
                .build();
    }

    private int calculateStreak(List<Expense> expenses) {
        if (expenses.isEmpty()) return 0;
        int streak = 0;
        LocalDate today = LocalDate.now();
        for (int i = 0; i < 365; i++) {
            LocalDate day = today.minusDays(i);
            boolean hasActivity = expenses.stream()
                    .anyMatch(e -> e.getExpenseDate().equals(day));
            if (hasActivity) streak++;
            else if (i > 0) break;
        }
        return streak;
    }

    private int calculateNoSpendDays(
            Long userId, List<Expense> expenses
    ) {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate today = LocalDate.now();
        int noSpendDays = 0;
        for (LocalDate date = startOfMonth;
             !date.isAfter(today);
             date = date.plusDays(1)) {
            LocalDate finalDate = date;
            boolean hasExpense = expenses.stream()
                    .anyMatch(e ->
                            e.getExpenseDate().equals(finalDate) &&
                                    e.getTransactionType() ==
                                            Expense.TransactionType.DEBIT);
            if (!hasExpense) noSpendDays++;
        }
        return noSpendDays;
    }

    private String getLevelName(int level) {
        return switch (level) {
            case 1 -> "Beginner Saver";
            case 2 -> "Smart Spender";
            case 3 -> "Budget Tracker";
            case 4 -> "Money Mindful";
            case 5 -> "Finance Aware";
            case 6 -> "Savings Expert";
            case 7 -> "Budget Master";
            case 8 -> "Wealth Builder";
            case 9 -> "Finance Pro";
            case 10 -> "Money Maestro";
            default -> "Beginner Saver";
        };
    }
}