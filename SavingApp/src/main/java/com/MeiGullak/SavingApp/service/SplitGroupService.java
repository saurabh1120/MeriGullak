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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SplitGroupService {

    private final SplitGroupRepository groupRepository;
    private final SplitGroupMemberRepository memberRepository;
    private final SplitExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final AuthHelper authHelper;
    private final EmailService emailService;

    @Transactional
    public SplitGroupResponse createGroup(SplitGroupRequest request) {
        User currentUser = authHelper.getCurrentUser();

        SplitGroup group = SplitGroup.builder()
                .name(request.getName())
                .icon(request.getIcon())
                .color(request.getColor())
                .description(request.getDescription())
                .createdBy(currentUser)
                .build();

        group = groupRepository.save(group);

        // Add creator as member first
        SplitGroupMember creatorMember = SplitGroupMember.builder()
                .group(group)
                .user(currentUser)
                .build();
        memberRepository.save(creatorMember);

        // Add other members
        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {
                if (memberId.equals(currentUser.getId())) continue;

                User member = userRepository.findById(memberId)
                        .orElseThrow(() -> new CustomException(
                                "User not found with id: " + memberId,
                                HttpStatus.NOT_FOUND));

                SplitGroupMember groupMember =
                        SplitGroupMember.builder()
                                .group(group)
                                .user(member)
                                .build();
                memberRepository.save(groupMember);

                // Send email notification
                try {
                    emailService.sendGroupInviteEmail(
                            member.getEmail(),
                            member.getFullName(),
                            group.getName(),
                            currentUser.getFullName()
                    );
                } catch (Exception e) {
                    System.err.println(
                            "Failed to send group invite email: "
                                    + e.getMessage());
                }
            }
        }

        return mapToResponse(group);
    }

    public List<SplitGroupResponse> getMyGroups() {
        Long userId = authHelper.getCurrentUserId();
        return groupRepository.findGroupsByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SplitGroupResponse getGroupById(Long groupId) {
        Long userId = authHelper.getCurrentUserId();

        SplitGroup group = groupRepository
                .findByIdAndActiveTrue(groupId)
                .orElseThrow(() -> new CustomException(
                        "Group not found", HttpStatus.NOT_FOUND));

        if (!memberRepository.existsByGroupIdAndUserId(
                groupId, userId)) {
            throw new CustomException(
                    "You are not a member of this group",
                    HttpStatus.FORBIDDEN);
        }

        return mapToResponse(group);
    }

    @Transactional
    public String addMember(Long groupId, Long userId) {
        Long currentUserId = authHelper.getCurrentUserId();

        SplitGroup group = groupRepository
                .findByIdAndActiveTrue(groupId)
                .orElseThrow(() -> new CustomException(
                        "Group not found", HttpStatus.NOT_FOUND));

        if (!group.getCreatedBy().getId().equals(currentUserId)) {
            throw new CustomException(
                    "Only the group creator can add members",
                    HttpStatus.FORBIDDEN);
        }

        if (memberRepository.existsByGroupIdAndUserId(
                groupId, userId)) {
            throw new CustomException(
                    "User is already a member of this group",
                    HttpStatus.CONFLICT);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(
                        "User not found", HttpStatus.NOT_FOUND));

        SplitGroupMember member = SplitGroupMember.builder()
                .group(group)
                .user(user)
                .build();
        memberRepository.save(member);

        // Send email notification
        try {
            emailService.sendGroupInviteEmail(
                    user.getEmail(),
                    user.getFullName(),
                    group.getName(),
                    authHelper.getCurrentUser().getFullName()
            );
        } catch (Exception e) {
            System.err.println(
                    "Failed to send group invite email: "
                            + e.getMessage());
        }

        return user.getFullName() + " added to group successfully!";
    }

    @Transactional
    public String deleteGroup(Long groupId) {
        Long currentUserId = authHelper.getCurrentUserId();

        SplitGroup group = groupRepository
                .findByIdAndActiveTrue(groupId)
                .orElseThrow(() -> new CustomException(
                        "Group not found", HttpStatus.NOT_FOUND));

        if (!group.getCreatedBy().getId().equals(currentUserId)) {
            throw new CustomException(
                    "Only the group creator can delete this group",
                    HttpStatus.FORBIDDEN);
        }

        group.setActive(false);
        groupRepository.save(group);
        return "Group deleted successfully";
    }

    public SplitGroupResponse mapToResponse(SplitGroup group) {
        List<SplitGroupMember> members =
                memberRepository.findByGroupId(group.getId());

        List<FriendResponse> memberResponses = members.stream()
                .map(m -> FriendResponse.builder()
                        .userId(m.getUser().getId())
                        .fullName(m.getUser().getFullName())
                        .email(m.getUser().getEmail())
                        .build())
                .collect(Collectors.toList());

        int totalExpenses = expenseRepository
                .findByGroupIdOrderByCreatedAtDesc(group.getId()).size();

        BigDecimal totalAmount = expenseRepository
                .getTotalByGroupId(group.getId());

        return SplitGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .icon(group.getIcon())
                .color(group.getColor())
                .description(group.getDescription())
                .createdByName(group.getCreatedBy().getFullName())
                .members(memberResponses)
                .totalExpenses(totalExpenses)
                .totalAmount(totalAmount != null
                        ? totalAmount : BigDecimal.ZERO)
                .createdAt(group.getCreatedAt())
                .build();
    }
}