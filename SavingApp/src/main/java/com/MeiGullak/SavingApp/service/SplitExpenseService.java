package com.MeiGullak.SavingApp.service;
import com.MeiGullak.SavingApp.dto.GroupHistoryResponse;
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

        SplitGroup group = groupRepository
            .findByIdAndActiveTrue(request.getGroupId())
            .orElseThrow(() -> new CustomException(
                "Group not found", HttpStatus.NOT_FOUND));

        if (!memberRepository.existsByGroupIdAndUserId(
            request.getGroupId(), currentUserId)) {
            throw new CustomException(
                "You are not a member of this group",
                HttpStatus.FORBIDDEN);
        }

        User paidBy = userRepository
            .findById(request.getPaidById())
            .orElseThrow(() -> new CustomException(
                "Paid by user not found", HttpStatus.NOT_FOUND));

        SplitExpense.SplitType splitType =
            request.getSplitType() != null
                ? request.getSplitType()
                : SplitExpense.SplitType.EQUAL;

        SplitExpense expense = SplitExpense.builder()
            .group(group)
            .paidBy(paidBy)
            .title(request.getTitle())
            .description(request.getDescription())
            .totalAmount(request.getTotalAmount())
            .splitType(splitType)
            .expenseDate(request.getExpenseDate() != null
                ? request.getExpenseDate() : LocalDate.now())
            .build();

        expense = expenseRepository.save(expense);

        List<SplitGroupMember> members =
            memberRepository.findByGroupId(request.getGroupId());

        createShares(expense, request, members, paidBy, splitType);

        final SplitExpense savedExpense = expense;
        members.stream()
            .filter(m -> !m.getUser().getId()
                .equals(paidBy.getId()))
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
                        "Email error: " + e.getMessage());
                }
            });

        return mapToResponse(expense);
    }

    @Transactional
    public SplitExpenseResponse updateExpense(
        Long expenseId, SplitExpenseRequest request
    ) {
        Long currentUserId = authHelper.getCurrentUserId();

        SplitExpense expense = expenseRepository
            .findById(expenseId)
            .orElseThrow(() -> new CustomException(
                "Expense not found", HttpStatus.NOT_FOUND));

        if (!memberRepository.existsByGroupIdAndUserId(
            expense.getGroup().getId(), currentUserId)) {
            throw new CustomException(
                "You are not a member of this group",
                HttpStatus.FORBIDDEN);
        }

        User paidBy = userRepository
            .findById(request.getPaidById())
            .orElseThrow(() -> new CustomException(
                "Paid by user not found", HttpStatus.NOT_FOUND));

        SplitExpense.SplitType splitType =
            request.getSplitType() != null
                ? request.getSplitType()
                : SplitExpense.SplitType.EQUAL;

        expense.setTitle(request.getTitle());
        expense.setDescription(request.getDescription());
        expense.setTotalAmount(request.getTotalAmount());
        expense.setPaidBy(paidBy);
        expense.setSplitType(splitType);
        if (request.getExpenseDate() != null) {
            expense.setExpenseDate(request.getExpenseDate());
        }

        expense = expenseRepository.save(expense);

        List<SplitShare> oldShares =
            shareRepository.findByExpenseId(expenseId);
        shareRepository.deleteAll(oldShares);

        List<SplitGroupMember> members =
            memberRepository.findByGroupId(
                expense.getGroup().getId());

        createShares(expense, request, members, paidBy, splitType);

        return mapToResponse(expense);
    }

    @Transactional
    public String deleteExpense(Long expenseId) {
        Long currentUserId = authHelper.getCurrentUserId();

        SplitExpense expense = expenseRepository
            .findById(expenseId)
            .orElseThrow(() -> new CustomException(
                "Expense not found", HttpStatus.NOT_FOUND));

        if (!memberRepository.existsByGroupIdAndUserId(
            expense.getGroup().getId(), currentUserId)) {
            throw new CustomException(
                "You are not a member of this group",
                HttpStatus.FORBIDDEN);
        }

        shareRepository.deleteAll(
            shareRepository.findByExpenseId(expenseId));
        expenseRepository.delete(expense);

        return "Expense deleted successfully";
    }

    private void createShares(
        SplitExpense expense,
        SplitExpenseRequest request,
        List<SplitGroupMember> members,
        User paidBy,
        SplitExpense.SplitType splitType
    ) {
        switch (splitType) {
            case EQUAL ->
                handleEqualSplit(expense, members, paidBy);
            case CUSTOM ->
                handleCustomSplit(expense, request, members, paidBy);
            case SHARES ->
                handleSharesSplit(
                    expense, members, request, paidBy);
        }
    }

    private void handleEqualSplit(
        SplitExpense expense,
        List<SplitGroupMember> members,
        User paidBy
    ) {
        int count = members.size();
        double total = expense.getTotalAmount().doubleValue();
        double share = Math.round(
            (total / count) * 100.0) / 100.0;

        for (SplitGroupMember member : members) {
            boolean isPayer = member.getUser().getId()
                .equals(paidBy.getId());

            SplitShare splitShare = SplitShare.builder()
                .expense(expense)
                .user(member.getUser())
                .shareAmount(BigDecimal.valueOf(share))
                .paidAmount(isPayer
                    ? BigDecimal.valueOf(total)
                    : BigDecimal.ZERO)
                .settled(isPayer)
                .build();
            shareRepository.save(splitShare);
        }
    }

    private void handleCustomSplit(
        SplitExpense expense,
        SplitExpenseRequest request,
        List<SplitGroupMember> members,
        User paidBy
    ) {
        if (request.getCustomShares() == null
            || request.getCustomShares().isEmpty()) {
            throw new CustomException(
                "Custom share amounts required",
                HttpStatus.BAD_REQUEST);
        }

        double total = expense.getTotalAmount().doubleValue();
        int memberCount = request.getCustomShares().size();
        double equalShare = Math.round(
            (total / memberCount) * 100.0) / 100.0;

        // Find creditor = person who paid most
        Long creditorId = paidBy.getId();
        double maxPaid = -1;
        for (Map.Entry<Long, BigDecimal> e :
            request.getCustomShares().entrySet()) {
            double paid = e.getValue().doubleValue();
            if (paid > maxPaid) {
                maxPaid = paid;
                creditorId = e.getKey();
            }
        }

        for (Map.Entry<Long, BigDecimal> entry :
            request.getCustomShares().entrySet()) {

            User shareUser = userRepository
                .findById(entry.getKey())
                .orElseThrow(() -> new CustomException(
                    "User not found: " + entry.getKey(),
                    HttpStatus.NOT_FOUND));

            double actuallyPaid = entry.getValue().doubleValue();
            double theyOwe = equalShare - actuallyPaid;

            boolean isSettled = theyOwe <= 0.01;
            double shareAmount = isSettled
                ? equalShare
                : Math.round(theyOwe * 100.0) / 100.0;

            SplitShare splitShare = SplitShare.builder()
                .expense(expense)
                .user(shareUser)
                .shareAmount(BigDecimal.valueOf(shareAmount))
                .paidAmount(BigDecimal.valueOf(actuallyPaid))
                .settled(isSettled)
                .build();
            shareRepository.save(splitShare);
        }

        // Update paidBy to creditor for balance tracking
        final Long finalCreditorId = creditorId;
        userRepository.findById(finalCreditorId).ifPresent(c -> {
            expense.setPaidBy(c);
            expenseRepository.save(expense);
        });
    }

    // ── SHARES SPLIT ─────────────────────────────────────
    private void handleSharesSplit(
        SplitExpense expense,
        List<SplitGroupMember> members,
        SplitExpenseRequest request,
        User paidBy
    ) {
        if (request.getMemberShares() == null
            || request.getMemberShares().isEmpty()) {
            throw new CustomException(
                "Member shares required",
                HttpStatus.BAD_REQUEST);
        }

        int totalShares = request.getMemberShares().values()
            .stream().mapToInt(Integer::intValue).sum();

        if (totalShares <= 0) throw new CustomException(
            "Total shares must be > 0", HttpStatus.BAD_REQUEST);

        double total = expense.getTotalAmount().doubleValue();
        double amountPerShare = total / totalShares;

        for (Map.Entry<Long, Integer> entry :
            request.getMemberShares().entrySet()) {

            User shareUser = userRepository
                .findById(entry.getKey())
                .orElseThrow(() -> new CustomException(
                    "User not found: " + entry.getKey(),
                    HttpStatus.NOT_FOUND));

            double shareAmount = Math.round(
                amountPerShare * entry.getValue() * 100.0) / 100.0;

            boolean isPayer = shareUser.getId()
                .equals(paidBy.getId());

            SplitShare splitShare = SplitShare.builder()
                .expense(expense)
                .user(shareUser)
                .shareAmount(BigDecimal.valueOf(shareAmount))
                .paidAmount(isPayer
                    ? BigDecimal.valueOf(total)
                    : BigDecimal.ZERO)
                .settled(isPayer)
                .build();
            shareRepository.save(splitShare);
        }
    }

    // ── GET GROUP EXPENSES ───────────────────────────────
    public List<SplitExpenseResponse> getGroupExpenses(
        Long groupId
    ) {
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

    // ── GET BALANCES ─────────────────────────────────────
    public BalanceSummary getGroupBalances(Long groupId) {
        Long currentUserId = authHelper.getCurrentUserId();

        List<SplitGroupMember> members =
            memberRepository.findByGroupId(groupId);

        List<SplitExpense> expenses =
            expenseRepository
                .findByGroupIdOrderByCreatedAtDesc(groupId);

        // Track what each person owes whom
        // owes["A:B"] = A owes B this much
        Map<String, Double> owes = new HashMap<>();

        for (SplitExpense expense : expenses) {
            Long payerId = expense.getPaidBy().getId();
            List<SplitShare> shares =
                shareRepository.findByExpenseId(expense.getId());

            for (SplitShare share : shares) {
                Long owerId = share.getUser().getId();
                if (share.isSettled()) continue;
                if (owerId.equals(payerId)) continue;

                String key = owerId + ":" + payerId;
                owes.merge(key,
                    share.getShareAmount().doubleValue(),
                    Double::sum);
            }
        }

        // Also account for partial settlements
        // Each settlement reduces what paidBy owes paidTo
        List<SplitSettlement> settlements =
            settlementRepository
                .findByGroupIdOrderBySettledAtDesc(groupId);

        for (SplitSettlement settlement : settlements) {
            Long fromId = settlement.getPaidBy().getId();
            Long toId = settlement.getPaidTo().getId();
            double amount = settlement.getAmount().doubleValue();

            // Reduce what fromId owes toId
            String key = fromId + ":" + toId;
            double current = owes.getOrDefault(key, 0.0);
            double remaining = current - amount;

            if (remaining <= 0.01) {
                owes.remove(key);
                // If overpaid, toId now owes fromId the diff
                if (remaining < -0.01) {
                    String reverseKey = toId + ":" + fromId;
                    owes.merge(reverseKey,
                        Math.abs(remaining), Double::sum);
                }
            } else {
                owes.put(key, remaining);
            }
        }

        // Build response from current user's perspective
        List<BalanceSummary.UserBalance> userBalances =
            new ArrayList<>();
        double totalOwe = 0;
        double totalOwed = 0;

        Set<Long> memberIds = members.stream()
            .map(m -> m.getUser().getId())
            .collect(Collectors.toSet());

        for (Long memberId : memberIds) {
            if (memberId.equals(currentUserId)) continue;

            double iOwe = owes.getOrDefault(
                currentUserId + ":" + memberId, 0.0);
            double theyOwe = owes.getOrDefault(
                memberId + ":" + currentUserId, 0.0);

            double net = theyOwe - iOwe;
            if (Math.abs(net) < 0.01) continue;

            String memberName = members.stream()
                .filter(m -> m.getUser().getId().equals(memberId))
                .map(m -> m.getUser().getFullName())
                .findFirst().orElse("Unknown");

            String memberEmail = members.stream()
                .filter(m -> m.getUser().getId().equals(memberId))
                .map(m -> m.getUser().getEmail())
                .findFirst().orElse("");

            userBalances.add(BalanceSummary.UserBalance.builder()
                .userId(memberId)
                .userName(memberName)
                .userEmail(memberEmail)
                .amount(BigDecimal.valueOf(net))
                .build());

            if (net > 0) totalOwed += net;
            else totalOwe += Math.abs(net);
        }

        return BalanceSummary.builder()
            .totalYouOwe(BigDecimal.valueOf(totalOwe))
            .totalOwedToYou(BigDecimal.valueOf(totalOwed))
            .netBalance(BigDecimal.valueOf(totalOwed - totalOwe))
            .balances(userBalances)
            .build();
    }

    // ── FULL SETTLE UP ───────────────────────────────────
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

        // Mark all unsettled shares as settled
        List<SplitShare> unsettled = shareRepository
            .findUnsettledByGroupAndUser(
                groupId, currentUser.getId());

        BigDecimal totalSettled = BigDecimal.ZERO;

        for (SplitShare share : unsettled) {
            if (share.getExpense().getPaidBy().getId()
                .equals(otherUserId)) {
                share.setSettled(true);
                totalSettled = totalSettled
                    .add(share.getShareAmount());
                shareRepository.save(share);
            }
        }

        if (totalSettled.compareTo(BigDecimal.ZERO) > 0) {
            settlementRepository.save(
                SplitSettlement.builder()
                    .group(group)
                    .paidBy(currentUser)
                    .paidTo(otherUser)
                    .amount(totalSettled)
                    .note("Fully settled via app")
                    .build());

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
                    "Settlement email error: " + e.getMessage());
            }

            return "Successfully settled ₹"
                + totalSettled + " with "
                + otherUser.getFullName();
        }

        return "Nothing to settle with "
            + otherUser.getFullName();
    }

    // ── PARTIAL SETTLE UP — NEW ───────────────────────────
    // Records a partial cash payment between two members
    // e.g. Gayatri owes ₹800, pays ₹700 cash
    // → Balance reduces to ₹100
    @Transactional
    public BalanceSummary partialSettle(
        Long groupId, Long otherUserId, BigDecimal amount
    ) {
        User currentUser = authHelper.getCurrentUser();

        User otherUser = userRepository.findById(otherUserId)
            .orElseThrow(() -> new CustomException(
                "User not found", HttpStatus.NOT_FOUND));

        SplitGroup group = groupRepository
            .findByIdAndActiveTrue(groupId)
            .orElseThrow(() -> new CustomException(
                "Group not found", HttpStatus.NOT_FOUND));

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException(
                "Amount must be greater than 0",
                HttpStatus.BAD_REQUEST);
        }

        // Record this partial payment as a settlement
        // The balance calculation will automatically subtract this
        settlementRepository.save(
            SplitSettlement.builder()
                .group(group)
                .paidBy(currentUser)   // who gave cash
                .paidTo(otherUser)     // who received cash
                .amount(amount)
                .note("Partial cash payment ₹" + amount)
                .build());

        try {
            emailService.sendSettlementEmail(
                otherUser.getEmail(),
                otherUser.getFullName(),
                currentUser.getFullName(),
                amount.toString(),
                group.getName()
            );
        } catch (Exception e) {
            System.err.println(
                "Settlement email error: " + e.getMessage());
        }

        // Return updated balances
        return getGroupBalances(groupId);
    }

    // ── MAP TO RESPONSE ──────────────────────────────────
    public SplitExpenseResponse mapToResponse(
        SplitExpense expense
    ) {
        List<SplitShare> shares =
            shareRepository.findByExpenseId(expense.getId());

        List<SplitExpenseResponse.ShareDetail> shareDetails =
            shares.stream()
                .map(s -> SplitExpenseResponse.ShareDetail.builder()
                    .userId(s.getUser().getId())
                    .userName(s.getUser().getFullName())
                    .shareAmount(s.getShareAmount())
                    .paidAmount(s.getPaidAmount())
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

    // ── GET GROUP HISTORY ────────────────────────────────────
    public List<GroupHistoryResponse> getGroupHistory(Long groupId) {
        Long currentUserId = authHelper.getCurrentUserId();

        if (!memberRepository.existsByGroupIdAndUserId(
                groupId, currentUserId)) {
            throw new CustomException(
                    "You are not a member of this group",
                    HttpStatus.FORBIDDEN);
        }

        List<GroupHistoryResponse> history = new ArrayList<>();

        // 1. Add all expenses
        List<SplitExpense> expenses =
                expenseRepository
                        .findByGroupIdOrderByCreatedAtDesc(groupId);

        for (SplitExpense expense : expenses) {
            String icon = switch (expense.getSplitType()) {
                case EQUAL -> "⚖️";
                case CUSTOM -> "✏️";
                case SHARES -> "📊";
            };

            history.add(GroupHistoryResponse.builder()
                    .id(expense.getId())
                    .type("EXPENSE")
                    .title(expense.getTitle())
                    .description(expense.getDescription())
                    .fromName(expense.getPaidBy().getFullName())
                    .amount(expense.getTotalAmount())
                    .splitType(expense.getSplitType().name())
                    .createdAt(expense.getCreatedAt())
                    .icon(icon)
                    .color("#c44b8a")
                    .build());
        }

        // 2. Add all settlements (cash payments)
        List<SplitSettlement> settlements =
                settlementRepository
                        .findByGroupIdOrderBySettledAtDesc(groupId);

        for (SplitSettlement settlement : settlements) {
            history.add(GroupHistoryResponse.builder()
                    .id(settlement.getId())
                    .type("SETTLEMENT")
                    .title("Cash Payment")
                    .description(settlement.getNote())
                    .fromName(settlement.getPaidBy().getFullName())
                    .toName(settlement.getPaidTo().getFullName())
                    .amount(settlement.getAmount())
                    .createdAt(settlement.getSettledAt())
                    .icon("💵")
                    .color("#3ecf8e")
                    .build());
        }

        // Sort newest first
        history.sort((a, b) ->
                b.getCreatedAt().compareTo(a.getCreatedAt()));

        return history;
    }
}
