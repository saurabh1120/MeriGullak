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
    private String gender;
    private String address;
    private String city;
    private String country;
    private String profilePhoto;
    private String role;
    private boolean emailVerified;
    private String message;
}