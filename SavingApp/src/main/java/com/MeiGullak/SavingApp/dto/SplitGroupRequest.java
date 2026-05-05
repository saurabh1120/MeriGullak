package com.MeiGullak.SavingApp.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class SplitGroupRequest {

    @NotBlank(message = "Group name is required")
    private String name;

    private String icon;
    private String color;
    private String description;
    private List<Long> memberIds;
}