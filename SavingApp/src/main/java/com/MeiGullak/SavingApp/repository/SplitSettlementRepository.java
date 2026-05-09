package com.MeiGullak.SavingApp.repository;

import com.MeiGullak.SavingApp.entity.SplitSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SplitSettlementRepository
    extends JpaRepository<SplitSettlement, Long> {

    List<SplitSettlement> findByGroupIdOrderBySettledAtDesc(
        Long groupId);

    List<SplitSettlement> findByPaidByIdOrPaidToId(
        Long paidById, Long paidToId);
}
