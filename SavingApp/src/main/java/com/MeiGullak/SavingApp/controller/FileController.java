package com.MeiGullak.SavingApp.controller;

import com.MeiGullak.SavingApp.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "general") String folder
    ) {
        String url = fileStorageService.saveFile(file, folder);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/uploads/**")
    public ResponseEntity<Resource> serveFile(
            @RequestParam String path
    ) {
        try {
            Path filePath = Paths.get(path.substring(1));
            Resource resource = new UrlResource(
                    filePath.toUri());
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}