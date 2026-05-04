package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.entity.User;
import com.MeiGullak.SavingApp.exception.CustomException;
import com.MeiGullak.SavingApp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthHelper authHelper;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse getProfile() {
        User user = authHelper.getCurrentUser();
        return AuthResponse.builder()
                .email(user.getEmail())
                .fullName(user.getFullName())
                .mobile(user.getMobile())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .build();
    }

    public AuthResponse updateProfile(UpdateProfileRequest request) {
        User user = authHelper.getCurrentUser();

        if (request.getFullName() != null
                && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getMobile() != null
                && !request.getMobile().isBlank()) {
            user.setMobile(request.getMobile());
        }

        userRepository.save(user);

        return AuthResponse.builder()
                .email(user.getEmail())
                .fullName(user.getFullName())
                .mobile(user.getMobile())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .message("Profile updated successfully!")
                .build();
    }

    public String changePassword(ChangePasswordRequest request) {
        User user = authHelper.getCurrentUser();

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {
            throw new CustomException(
                    "Current password is incorrect",
                    HttpStatus.BAD_REQUEST);
        }

        if (request.getNewPassword().length() < 6) {
            throw new CustomException(
                    "New password must be at least 6 characters",
                    HttpStatus.BAD_REQUEST);
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return "Password changed successfully!";
    }
}