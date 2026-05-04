package com.MeiGullak.SavingApp.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String mobile;
    private String role;
    private boolean emailVerified;
    private String message;
}