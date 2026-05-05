package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.FriendResponse;
import com.MeiGullak.SavingApp.entity.Friend;
import com.MeiGullak.SavingApp.entity.User;
import com.MeiGullak.SavingApp.exception.CustomException;
import com.MeiGullak.SavingApp.repository.FriendRepository;
import com.MeiGullak.SavingApp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;
    private final AuthHelper authHelper;
    private final EmailService emailService;

    public String sendRequest(String email) {
        User currentUser = authHelper.getCurrentUser();

        if (currentUser.getEmail().equals(email)) {
            throw new CustomException(
                    "You cannot add yourself as friend",
                    HttpStatus.BAD_REQUEST);
        }

        User receiver = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(
                        "No Meri Gullak account found with email: " + email,
                        HttpStatus.NOT_FOUND));

        friendRepository.findBetweenUsers(
                        currentUser.getId(), receiver.getId())
                .ifPresent(f -> {
                    throw new CustomException(
                            "Friend request already exists",
                            HttpStatus.CONFLICT);
                });

        Friend friend = Friend.builder()
                .requester(currentUser)
                .receiver(receiver)
                .build();

        friendRepository.save(friend);

        // Send email notification to receiver
        try {
            emailService.sendFriendRequestEmail(
                    receiver.getEmail(),
                    receiver.getFullName(),
                    currentUser.getFullName()
            );
        } catch (Exception e) {
            System.err.println(
                    "Failed to send friend request email: "
                            + e.getMessage());
        }

        return "Friend request sent to " + receiver.getFullName();
    }

    public String respondToRequest(Long requestId, boolean accept) {
        User currentUser = authHelper.getCurrentUser();

        Friend friend = friendRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(
                        "Request not found", HttpStatus.NOT_FOUND));

        if (!friend.getReceiver().getId()
                .equals(currentUser.getId())) {
            throw new CustomException(
                    "Not authorized to respond to this request",
                    HttpStatus.FORBIDDEN);
        }

        friend.setStatus(accept
                ? Friend.FriendStatus.ACCEPTED
                : Friend.FriendStatus.REJECTED);

        friendRepository.save(friend);

        // Send email notification if accepted
        if (accept) {
            try {
                emailService.sendFriendAcceptedEmail(
                        friend.getRequester().getEmail(),
                        friend.getRequester().getFullName(),
                        currentUser.getFullName()
                );
            } catch (Exception e) {
                System.err.println(
                        "Failed to send friend accepted email: "
                                + e.getMessage());
            }
        }

        return accept
                ? "Friend request accepted! 🎉"
                : "Friend request rejected";
    }

    public List<FriendResponse> getMyFriends() {
        Long userId = authHelper.getCurrentUserId();
        return friendRepository.findAcceptedFriends(userId)
                .stream()
                .map(f -> mapToResponse(f, userId))
                .collect(Collectors.toList());
    }

    public List<FriendResponse> getPendingRequests() {
        Long userId = authHelper.getCurrentUserId();
        return friendRepository.findPendingRequests(userId)
                .stream()
                .map(f -> mapToResponse(f, userId))
                .collect(Collectors.toList());
    }

    public FriendResponse mapToResponse(
            Friend f, Long currentUserId
    ) {
        boolean isRequester = f.getRequester().getId()
                .equals(currentUserId);
        User otherUser = isRequester
                ? f.getReceiver()
                : f.getRequester();

        return FriendResponse.builder()
                .id(f.getId())
                .userId(otherUser.getId())
                .fullName(otherUser.getFullName())
                .email(otherUser.getEmail())
                .status(f.getStatus())
                .isRequester(isRequester)
                .build();
    }
}