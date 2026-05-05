package com.MeiGullak.SavingApp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "split_groups")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SplitGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String icon;
    private String color;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "group",
            cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SplitGroupMember> members;

    @Builder.Default
    private boolean active = true;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
