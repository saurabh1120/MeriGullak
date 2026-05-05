package com.MeiGullak.SavingApp.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UpdateProfileRequest {
    private String fullName;
    private String mobile;
    private String gender;
    private String address;
    private String city;
    private String country;
}