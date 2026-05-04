package com.MeiGullak.SavingApp.controller;

import com.MeiGullak.SavingApp.dto.TransferRequest;
import com.MeiGullak.SavingApp.entity.Transfer;
import com.MeiGullak.SavingApp.service.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
public class TransferController {

    private final TransferService transferService;

    @PostMapping
    public ResponseEntity<String> transfer(
            @Valid @RequestBody TransferRequest request
    ) {
        return ResponseEntity.ok(transferService.transfer(request));
    }

    @GetMapping
    public ResponseEntity<List<Transfer>> getAll() {
        return ResponseEntity.ok(transferService.getAllTransfers());
    }
}