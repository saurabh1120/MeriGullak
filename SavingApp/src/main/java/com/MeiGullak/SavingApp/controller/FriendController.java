package com.MeiGullak.SavingApp.controller;

import com.MeiGullak.SavingApp.dto.FriendResponse;
import com.MeiGullak.SavingApp.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @PostMapping("/request")
    public ResponseEntity<String> sendRequest(
            @RequestParam String email
    ) {
        return ResponseEntity.ok(friendService.sendRequest(email));
    }

    @PutMapping("/request/{id}/respond")
    public ResponseEntity<String> respond(
            @PathVariable Long id,
            @RequestParam boolean accept
    ) {
        return ResponseEntity.ok(
                friendService.respondToRequest(id, accept));
    }

    @GetMapping
    public ResponseEntity<List<FriendResponse>> getMyFriends() {
        return ResponseEntity.ok(friendService.getMyFriends());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<FriendResponse>> getPending() {
        return ResponseEntity.ok(friendService.getPendingRequests());
    }
}