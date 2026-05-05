package com.MeiGullak.SavingApp.controller;

import com.MeiGullak.SavingApp.dto.*;
import com.MeiGullak.SavingApp.service.SplitGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/split/groups")
@RequiredArgsConstructor
public class SplitGroupController {

    private final SplitGroupService groupService;

    @PostMapping
    public ResponseEntity<SplitGroupResponse> create(
            @Valid @RequestBody SplitGroupRequest request
    ) {
        return ResponseEntity.ok(groupService.createGroup(request));
    }

    @GetMapping
    public ResponseEntity<List<SplitGroupResponse>> getAll() {
        return ResponseEntity.ok(groupService.getMyGroups());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SplitGroupResponse> getById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<String> addMember(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(groupService.addMember(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.deleteGroup(id));
    }
}