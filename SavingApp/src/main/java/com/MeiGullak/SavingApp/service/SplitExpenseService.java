package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.entity.*;
import com.MeiGullak.SavingApp.exception.CustomException;
import com.MeiGullak.SavingApp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SplitExpenseService {

    private final SplitExpenseRepository expenseRepository;
    private final SplitShareRepository shareRepository;
    private final SplitSettlementRepository settlementRepository;
    private final SplitGroupRepository groupRepository;
    private final SplitGroupMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final AuthHelper authHelper;
    private final EmailService emailService;

    @Transactional
    public SplitExpenseResponse addExpense(
            SplitExpenseRequest request
    ) {
        Long currentUserId = authHelper.getCurrentUserId();

        // Validate group exists
        SplitGroup group = groupRepository
                .findByIdAndActiveTrue(request.getGroupId())
                .orElseThrow(() -> new CustomException(
                        "Group not found", HttpStatus.NOT_FOUND));

        // Validate current user is member
        if (!memberRepository.existsByGroupIdAndUserId(
                request.getGroupId(), currentUserId)) {
            throw new CustomException(
                    "You are not a member of this group",
                    HttpStatus.FORBIDDEN);
        }

        // Validate paid by user
        User paidBy = userRepository.findById(request.getPaidById())
                .orElseThrow(() -> new CustomException(
                        "Paid by user not found", HttpStatus.NOT_FOUND));

        // Build and save expense
        SplitExpense expense = SplitExpense.builder()
                .group(group)
                .paidBy(paidBy)
                .title(request.getTitle())
                .description(request.getDescription())
                .totalAmount(request.getTotalAmount())
                .splitType(request.getSplitType() != null
                        ? request.getSplitType()
                        : SplitExpense.SplitType.EQUAL)
                .expenseDate(request.getExpenseDate() != null
                        ? request.getExpenseDate()
                        : LocalDate.now())
                .build();

        expense = expenseRepository.save(expense);

        // Get all group members
        List<SplitGroupMember> members =
                memberRepository.findByGroupId(request.getGroupId());

        if (expense.getSplitType() == SplitExpense.SplitType.EQUAL) {
            // Equal split
            double total = request.getTotalAmount().doubleValue();
            double share = Math.round(
                    (total / members.size()) * 100.0) / 100.0;
            BigDecimal shareAmount = BigDecimal.valueOf(share);

            for (SplitGroupMember member : members) {
                boolean isPayer = member.getUser().getId()
                        .equals(paidBy.getId());
                SplitShare splitShare = SplitShare.builder()
                        .expense(expense)
                        .user(member.getUser())
                        .shareAmount(shareAmount)
                        .settled(isPayer) // payer doesn't owe themselves
                        .build();
                shareRepository.save(splitShare);
            }
        } else {
            // Custom split
            if (request.getCustomShares() == null
                    || request.getCustomShares().isEmpty()) {
                throw new CustomException(
                        "Custom share amounts are required",
                        HttpStatus.BAD_REQUEST);
            }

            for (Map.Entry<Long, BigDecimal> entry :
                    request.getCustomShares().entrySet()) {

                User shareUser = userRepository
                        .findById(entry.getKey())
                        .orElseThrow(() -> new CustomException(
                                "User not found: " + entry.getKey(),
                                HttpStatus.NOT_FOUND));

                boolean isPayer = shareUser.getId()
                        .equals(paidBy.getId());

                SplitShare splitShare = SplitShare.builder()
                        .expense(expense)
                        .user(shareUser)
                        .shareAmount(entry.getValue())
                        .settled(isPayer)
                        .build();
                shareRepository.save(splitShare);
            }
        }

        // Send email notifications to all members except payer
        final SplitExpense savedExpense = expense;
        members.stream()
                .filter(m -> !m.getUser().getId().equals(paidBy.getId()))
                .forEach(m -> {
                    try {
                        emailService.sendExpenseAddedEmail(
                                m.getUser().getEmail(),
                                m.getUser().getFullName(),
                                group.getName(),
                                savedExpense.getTitle(),
                                savedExpense.getTotalAmount().toString(),
                                paidBy.getFullName()
                        );
                    } catch (Exception e) {
                        System.err.println(
                                "Failed to send expense email: "
                                        + e.getMessage());
                    }
                });

        return mapToResponse(expense);
    }

    public List<SplitExpenseResponse> getGroupExpenses(Long groupId) {
        Long currentUserId = authHelper.getCurrentUserId();

        if (!memberRepository.existsByGroupIdAndUserId(
                groupId, currentUserId)) {
            throw new CustomException(
                    "You are not a member of this group",
                    HttpStatus.FORBIDDEN);
        }

        return expenseRepository
                .findByGroupIdOrderByCreatedAtDesc(groupId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BalanceSummary getGroupBalances(Long groupId) {
        Long currentUserId = authHelper.getCurrentUserId();

        List<SplitGroupMember> members =
                memberRepository.findByGroupId(groupId);

        List<SplitExpense> expenses =
                expenseRepository.findByGroupIdOrderByCreatedAtDesc(groupId);

        // Calculate net balance per user
        Map<Long, BigDecimal> balances = new HashMap<>();
        for (SplitGroupMember member : members) {
            balances.put(member.getUser().getId(), BigDecimal.ZERO);
        }

        for (SplitExpense expense : expenses) {
            Long payerId = expense.getPaidBy().getId();
            List<SplitShare> shares =
                    shareRepository.findByExpenseId(expense.getId());

            for (SplitShare share : shares) {
                if (!share.isSettled()) {
                    Long owerId = share.getUser().getId();
                    if (!owerId.equals(payerId)) {
                        // Payer gets positive credit
                        balances.merge(
                                payerId,
                                share.getShareAmount(),
                                BigDecimal::add
                        );
                        // Ower gets negative debit
                        balances.merge(
                                owerId,
                                share.getShareAmount().negate(),
                                BigDecimal::add
                        );
                    }
                }
            }
        }

        // Build response relative to current user
        List<BalanceSummary.UserBalance> userBalances = new ArrayList<>();
        BigDecimal totalOwe = BigDecimal.ZERO;
        BigDecimal totalOwed = BigDecimal.ZERO;

        for (SplitGroupMember member : members) {
            Long memberId = member.getUser().getId();
            if (memberId.equals(currentUserId)) continue;

            BigDecimal memberBalance = balances.getOrDefault(
                    memberId, BigDecimal.ZERO);

            userBalances.add(BalanceSummary.UserBalance.builder()
                    .userId(memberId)
                    .userName(member.getUser().getFullName())
                    .userEmail(member.getUser().getEmail())
                    .amount(memberBalance)
                    .build());
        }

        BigDecimal myNet = balances.getOrDefault(
                currentUserId, BigDecimal.ZERO);

        if (myNet.compareTo(BigDecimal.ZERO) < 0) {
            totalOwe = myNet.abs();
        } else {
            totalOwed = myNet;
        }

        return BalanceSummary.builder()
                .totalYouOwe(totalOwe)
                .totalOwedToYou(totalOwed)
                .netBalance(myNet)
                .balances(userBalances)
                .build();
    }

    @Transactional
    public String settleUp(Long groupId, Long otherUserId) {
        User currentUser = authHelper.getCurrentUser();

        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new CustomException(
                        "User not found", HttpStatus.NOT_FOUND));

        SplitGroup group = groupRepository
                .findByIdAndActiveTrue(groupId)
                .orElseThrow(() -> new CustomException(
                        "Group not found", HttpStatus.NOT_FOUND));

        // Find all unsettled shares where current user owes otherUser
        List<SplitShare> unsettledShares = shareRepository
                .findUnsettledByGroupAndUser(groupId, currentUser.getId());

        BigDecimal totalSettled = BigDecimal.ZERO;

        for (SplitShare share : unsettledShares) {
            // Only settle shares where otherUser paid
            if (share.getExpense().getPaidBy().getId()
                    .equals(otherUserId)) {
                share.setSettled(true);
                totalSettled = totalSettled.add(share.getShareAmount());
                shareRepository.save(share);
            }
        }

        if (totalSettled.compareTo(BigDecimal.ZERO) > 0) {
            // Record settlement
            SplitSettlement settlement = SplitSettlement.builder()
                    .group(group)
                    .paidBy(currentUser)
                    .paidTo(otherUser)
                    .amount(totalSettled)
                    .note("Settled via app")
                    .build();
            settlementRepository.save(settlement);

            // Send email notification
            try {
                emailService.sendSettlementEmail(
                        otherUser.getEmail(),
                        otherUser.getFullName(),
                        currentUser.getFullName(),
                        totalSettled.toString(),
                        group.getName()
                );
            } catch (Exception e) {
                System.err.println(
                        "Failed to send settlement email: "
                                + e.getMessage());
            }

            return "Successfully settled ₹"
                    + totalSettled + " with "
                    + otherUser.getFullName();
        }

        return "Nothing to settle with " + otherUser.getFullName();
    }

    public SplitExpenseResponse mapToResponse(SplitExpense expense) {
        List<SplitShare> shares =
                shareRepository.findByExpenseId(expense.getId());

        List<SplitExpenseResponse.ShareDetail> shareDetails =
                shares.stream()
                        .map(s -> SplitExpenseResponse.ShareDetail.builder()
                                .userId(s.getUser().getId())
                                .userName(s.getUser().getFullName())
                                .shareAmount(s.getShareAmount())
                                .settled(s.isSettled())
                                .build())
                        .collect(Collectors.toList());

        return SplitExpenseResponse.builder()
                .id(expense.getId())
                .groupId(expense.getGroup().getId())
                .groupName(expense.getGroup().getName())
                .title(expense.getTitle())
                .description(expense.getDescription())
                .totalAmount(expense.getTotalAmount())
                .paidByName(expense.getPaidBy().getFullName())
                .paidById(expense.getPaidBy().getId())
                .splitType(expense.getSplitType())
                .expenseDate(expense.getExpenseDate())
                .receiptUrl(expense.getReceiptUrl())
                .shares(shareDetails)
                .build();
    }
}