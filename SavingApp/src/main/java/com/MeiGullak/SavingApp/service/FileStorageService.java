package com.MeiGullak.SavingApp.service;

import com.MeiGullak.SavingApp.exception.CustomException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String saveFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) return null;

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/"))) {
            throw new CustomException(
                    "Only image files are allowed", HttpStatus.BAD_REQUEST);
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new CustomException(
                    "File size must be less than 5MB",
                    HttpStatus.BAD_REQUEST);
        }

        try {
            // Create directory if not exists
            Path uploadPath = Paths.get(uploadDir, folder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null
                    && originalFilename.contains(".")) {
                extension = originalFilename.substring(
                        originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath,
                    StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + folder + "/" + filename;

        } catch (IOException e) {
            throw new CustomException(
                    "Failed to save file: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return;
        try {
            Path filePath = Paths.get(fileUrl.substring(1));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + e.getMessage());
        }
    }
}