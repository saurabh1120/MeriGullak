package com.MeiGullak.SavingApp.repository;

import com.MeiGullak.SavingApp.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransferRepository extends JpaRepository<Transfer, Long> {
    List<Transfer> findByUserIdOrderByCreatedAtDesc(Long userId);
}