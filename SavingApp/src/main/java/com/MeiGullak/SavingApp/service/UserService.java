package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.entity.User;
import com.MeiGullak.SavingApp.exception.CustomException;
import com.MeiGullak.SavingApp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthHelper authHelper;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    public AuthResponse getProfile() {
        User user = authHelper.getCurrentUser();
        return mapToResponse(user);
    }

    public AuthResponse updateProfile(
            UpdateProfileRequest request
    ) {
        User user = authHelper.getCurrentUser();

        if (request.getFullName() != null
                && !request.getFullName().isBlank())
            user.setFullName(request.getFullName());
        if (request.getMobile() != null
                && !request.getMobile().isBlank())
            user.setMobile(request.getMobile());
        if (request.getGender() != null)
            user.setGender(request.getGender());
        if (request.getAddress() != null)
            user.setAddress(request.getAddress());
        if (request.getCity() != null)
            user.setCity(request.getCity());
        if (request.getCountry() != null)
            user.setCountry(request.getCountry());

        userRepository.save(user);
        return mapToResponse(user);
    }

    public AuthResponse updateProfilePhoto(MultipartFile file) {
        User user = authHelper.getCurrentUser();

        // Delete old photo if exists
        if (user.getProfilePhoto() != null) {
            fileStorageService.deleteFile(user.getProfilePhoto());
        }

        String photoUrl = fileStorageService
                .saveFile(file, "profiles");
        user.setProfilePhoto(photoUrl);
        userRepository.save(user);

        return mapToResponse(user);
    }

    public String changePassword(ChangePasswordRequest request) {
        User user = authHelper.getCurrentUser();

        if (!passwordEncoder.matches(
                request.getCurrentPassword(), user.getPassword())) {
            throw new CustomException(
                    "Current password is incorrect",
                    HttpStatus.BAD_REQUEST);
        }

        if (request.getNewPassword().length() < 6) {
            throw new CustomException(
                    "Password must be at least 6 characters",
                    HttpStatus.BAD_REQUEST);
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return "Password changed successfully!";
    }

    private AuthResponse mapToResponse(User user) {
        return AuthResponse.builder()
                .email(user.getEmail())
                .fullName(user.getFullName())
                .mobile(user.getMobile())
                .gender(user.getGender())
                .address(user.getAddress())
                .city(user.getCity())
                .country(user.getCountry())
                .profilePhoto(user.getProfilePhoto())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .build();
    }
}