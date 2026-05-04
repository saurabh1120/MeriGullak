package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.entity.*;
import com.MeiGullak.SavingApp.exception.CustomException;
import com.MeiGullak.SavingApp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GullakService {

    private final GullakRepository gullakRepository;
    private final GullakTransactionRepository transactionRepository;
    private final AuthHelper authHelper;

    public GullakResponse createGullak(GullakRequest request) {
        User user = authHelper.getCurrentUser();

        Gullak gullak = Gullak.builder()
                .user(user)
                .goalName(request.getGoalName())
                .targetAmount(request.getTargetAmount())
                .targetDate(request.getTargetDate())
                .icon(request.getIcon())
                .color(request.getColor())
                .description(request.getDescription())
                .build();

        return mapToResponse(gullakRepository.save(gullak));
    }

    public List<GullakResponse> getAllGullaks() {
        Long userId = authHelper.getCurrentUserId();
        return gullakRepository
                .findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public GullakResponse getGullakById(Long id) {
        Long userId = authHelper.getCurrentUserId();
        Gullak gullak = gullakRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomException(
                        "Gullak not found", HttpStatus.NOT_FOUND));
        return mapToResponse(gullak);
    }

    @Transactional
    public GullakResponse addOrWithdraw(
            Long gullakId,
            GullakTransactionRequest request
    ) {
        User user = authHelper.getCurrentUser();
        Gullak gullak = gullakRepository
                .findByIdAndUserId(gullakId, user.getId())
                .orElseThrow(() -> new CustomException(
                        "Gullak not found", HttpStatus.NOT_FOUND));

        if (request.getType() == GullakTransaction.TransactionType.DEPOSIT) {
            gullak.setSavedAmount(
                    gullak.getSavedAmount().add(request.getAmount())
            );
        } else {
            if (gullak.getSavedAmount()
                    .compareTo(request.getAmount()) < 0) {
                throw new CustomException(
                        "Insufficient savings in Gullak",
                        HttpStatus.BAD_REQUEST
                );
            }
            gullak.setSavedAmount(
                    gullak.getSavedAmount().subtract(request.getAmount())
            );
        }

        // Check if goal completed
        if (gullak.getSavedAmount()
                .compareTo(gullak.getTargetAmount()) >= 0) {
            gullak.setStatus(Gullak.GullakStatus.COMPLETED);
        } else {
            gullak.setStatus(Gullak.GullakStatus.ACTIVE);
        }

        gullakRepository.save(gullak);

        // Save transaction history
        GullakTransaction tx = GullakTransaction.builder()
                .gullak(gullak)
                .user(user)
                .amount(request.getAmount())
                .type(request.getType())
                .note(request.getNote())
                .build();
        transactionRepository.save(tx);

        return mapToResponse(gullak);
    }

    public void deleteGullak(Long id) {
        Long userId = authHelper.getCurrentUserId();
        Gullak gullak = gullakRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomException(
                        "Gullak not found", HttpStatus.NOT_FOUND));
        gullak.setActive(false);
        gullakRepository.save(gullak);
    }

    public GullakResponse mapToResponse(Gullak gullak) {
        return GullakResponse.builder()
                .id(gullak.getId())
                .goalName(gullak.getGoalName())
                .icon(gullak.getIcon())
                .color(gullak.getColor())
                .description(gullak.getDescription())
                .targetAmount(gullak.getTargetAmount())
                .savedAmount(gullak.getSavedAmount())
                .remainingAmount(gullak.getRemainingAmount())
                .progressPercentage(gullak.getProgressPercentage())
                .targetDate(gullak.getTargetDate())
                .status(gullak.getStatus())
                .createdAt(gullak.getCreatedAt())
                .build();
    }
}