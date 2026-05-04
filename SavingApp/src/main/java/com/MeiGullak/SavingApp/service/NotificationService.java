package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.entity.*;
import com.MeiGullak.SavingApp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final GullakRepository gullakRepository;
    private final JavaMailSender mailSender;

    // Run every day at 9 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void sendDailyReminders() {
        List<User> users = userRepository.findAll();
        users.forEach(user -> {
            try {
                checkBudgetAlerts(user);
                checkGullakDeadlines(user);
            } catch (Exception e) {
                System.err.println(
                        "Notification failed for: " + user.getEmail());
            }
        });
    }

    private void checkBudgetAlerts(User user) {
        LocalDate now = LocalDate.now();
        List<Budget> budgets = budgetRepository
                .findByUserIdAndMonthAndYearAndActiveTrue(
                        user.getId(),
                        now.getMonthValue(),
                        now.getYear());

        budgets.stream()
                .filter(b -> b.isNearLimit() || b.isOverBudget())
                .forEach(budget -> sendEmail(
                        user.getEmail(),
                        "🔔 Meri Gullak - Budget Alert",
                        "Hi " + user.getFullName() + "!\n\n" +
                                (budget.isOverBudget()
                                        ? "⚠️ You have exceeded your " +
                                        budget.getCategory().name() + " budget!"
                                        : "🔔 You have used " +
                                        String.format("%.0f",
                                                budget.getUsagePercentage()) +
                                        "% of your " +
                                        budget.getCategory().name() + " budget.") +
                                "\n\nKeep tracking on Meri Gullak! 🪙"
                ));
    }

    private void checkGullakDeadlines(User user) {
        gullakRepository
                .findByUserIdAndActiveTrueOrderByCreatedAtDesc(
                        user.getId())
                .stream()
                .filter(g -> g.getTargetDate() != null &&
                        g.getTargetDate().isAfter(LocalDate.now()) &&
                        g.getTargetDate().isBefore(
                                LocalDate.now().plusDays(7)) &&
                        g.getStatus() != Gullak.GullakStatus.COMPLETED)
                .forEach(gullak -> sendEmail(
                        user.getEmail(),
                        "🪙 Meri Gullak - Goal Deadline Near",
                        "Hi " + user.getFullName() + "!\n\n" +
                                "Your goal '" + gullak.getGoalName() +
                                "' deadline is approaching on " +
                                gullak.getTargetDate() + ".\n" +
                                "You still need ₹" +
                                gullak.getRemainingAmount() +
                                " to complete your goal!\n\n" +
                                "Keep saving! 💪"
                ));
    }

    private void sendEmail(
            String to, String subject, String body
    ) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email failed: " + e.getMessage());
        }
    }
}