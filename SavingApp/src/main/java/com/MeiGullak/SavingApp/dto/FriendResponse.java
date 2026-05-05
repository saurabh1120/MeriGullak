package com.MeiGullak.SavingApp.dto;

import com.MeiGullak.SavingApp.entity.Friend;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FriendResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private Friend.FriendStatus status;
    private boolean isRequester;
}