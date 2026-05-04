package com.MeiGullak.SavingApp.repository;

import com.MeiGullak.SavingApp.entity.Gullak;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface GullakRepository extends JpaRepository<Gullak, Long> {
    List<Gullak> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);
    Optional<Gullak> findByIdAndUserId(Long id, Long userId);
}