package com.MeiGullak.SavingApp.controller;

import com.MeiGullak.SavingApp.dto.AnalyticsResponse;
import com.MeiGullak.SavingApp.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year
    ) {
        LocalDate now = LocalDate.now();
        int m = month == 0 ? now.getMonthValue() : month;
        int y = year == 0 ? now.getYear() : year;
        return ResponseEntity.ok(
                analyticsService.getAnalytics(m, y));
    }

    @GetMapping("/health-score")
    public ResponseEntity<Integer> getHealthScore() {
        Long userId = analyticsService.getAuthHelper()
                .getCurrentUserId();
        return ResponseEntity.ok(
                analyticsService.calculateHealthScore(userId));
    }
}