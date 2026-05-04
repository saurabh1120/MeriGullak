package com.MeiGullak.SavingApp.repository;

import com.MeiGullak.SavingApp.entity.GullakTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GullakTransactionRepository
        extends JpaRepository<GullakTransaction, Long> {
    List<GullakTransaction> findByGullakIdOrderByCreatedAtDesc(Long gullakId);
}