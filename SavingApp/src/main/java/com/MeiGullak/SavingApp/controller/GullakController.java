package com.MeiGullak.SavingApp.controller;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.service.GullakService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/gullaks")
@RequiredArgsConstructor
public class GullakController {

    private final GullakService gullakService;

    @PostMapping
    public ResponseEntity<GullakResponse> create(
            @Valid @RequestBody GullakRequest request
    ) {
        return ResponseEntity.ok(gullakService.createGullak(request));
    }

    @GetMapping
    public ResponseEntity<List<GullakResponse>> getAll() {
        return ResponseEntity.ok(gullakService.getAllGullaks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GullakResponse> getById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(gullakService.getGullakById(id));
    }

    @PostMapping("/{id}/transaction")
    public ResponseEntity<GullakResponse> addOrWithdraw(
            @PathVariable Long id,
            @Valid @RequestBody GullakTransactionRequest request
    ) {
        return ResponseEntity.ok(
                gullakService.addOrWithdraw(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        gullakService.deleteGullak(id);
        return ResponseEntity.ok("Gullak deleted successfully");
    }
}