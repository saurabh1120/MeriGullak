package com.MeiGullak.SavingApp.repository;

import com.MeiGullak.SavingApp.entity.SplitGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SplitGroupRepository
        extends JpaRepository<SplitGroup, Long> {

    @Query("SELECT DISTINCT g FROM SplitGroup g " +
            "JOIN g.members m WHERE m.user.id = :userId " +
            "AND g.active = true ORDER BY g.createdAt DESC")
    List<SplitGroup> findGroupsByUserId(@Param("userId") Long userId);

    Optional<SplitGroup> findByIdAndActiveTrue(Long id);
}