package com.MeiGullak.SavingApp.controller;

import com.MeiGullak.SavingApp.dto.AuthResponse;
import com.MeiGullak.SavingApp.dto.UpdateProfileRequest;
import com.MeiGullak.SavingApp.dto.ChangePasswordRequest;
import com.MeiGullak.SavingApp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(
            @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PostMapping("/profile-photo")
    public ResponseEntity<AuthResponse> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(
                userService.updateProfilePhoto(file));
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request
    ) {
        return ResponseEntity.ok(
                userService.changePassword(request));
    }
}