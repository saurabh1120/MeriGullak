package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.entity.*;
import com.MeiGullak.SavingApp.exception.CustomException;
import com.MeiGullak.SavingApp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email already registered", HttpStatus.CONFLICT);
        }
        if (request.getMobile() != null &&
                userRepository.existsByMobile(request.getMobile())) {
            throw new CustomException("Mobile already registered", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .emailVerified(false)
                .active(true)
                .build();

        userRepository.save(user);
        otpService.generateAndSendOtp(request.getEmail(), OtpVerification.OtpPurpose.REGISTRATION);

        return "Registration successful! OTP sent to " + request.getEmail();
    }

    public String verifyOtp(OtpVerifyRequest request) {
        boolean verified = otpService.verifyOtp(
                request.getEmail(),
                request.getOtp(),
                OtpVerification.OtpPurpose.REGISTRATION
        );

        if (!verified) {
            throw new CustomException("Invalid or expired OTP", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        user.setEmailVerified(true);
        userRepository.save(user);

        return "Email verified successfully!";
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(
                        "User not found", HttpStatus.NOT_FOUND));

        if (!user.isEmailVerified()) {
            throw new CustomException(
                    "Email not verified. Please verify OTP first.",
                    HttpStatus.FORBIDDEN
            );
        }

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
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
                .message("Login successful!")
                .build();
    }
    public String resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(
                        "Email not found", HttpStatus.NOT_FOUND));

        if (user.isEmailVerified()) {
            throw new CustomException(
                    "Email already verified", HttpStatus.BAD_REQUEST);
        }

        otpService.generateAndSendOtp(
                email, OtpVerification.OtpPurpose.REGISTRATION);

        return "OTP resent to " + email;
    }
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(
                        "No account found with this email",
                        HttpStatus.NOT_FOUND));

        otpService.generateAndSendOtp(
                email,
                OtpVerification.OtpPurpose.PASSWORD_RESET
        );

        return "OTP sent to " + email + " for password reset";
    }

    public String verifyForgotPasswordOtp(
            String email, String otp
    ) {
        boolean verified = otpService.verifyOtp(
                email, otp,
                OtpVerification.OtpPurpose.PASSWORD_RESET
        );

        if (!verified) {
            throw new CustomException(
                    "Invalid or expired OTP",
                    HttpStatus.BAD_REQUEST
            );
        }

        return "OTP verified successfully";
    }

    public String resetPassword(
            String email, String otp, String newPassword
    ) {
        // Verify OTP one more time for security
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(
                        "User not found", HttpStatus.NOT_FOUND));

        if (newPassword.length() < 6) {
            throw new CustomException(
                    "Password must be at least 6 characters",
                    HttpStatus.BAD_REQUEST
            );
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return "Password reset successfully! Please login.";
    }
}