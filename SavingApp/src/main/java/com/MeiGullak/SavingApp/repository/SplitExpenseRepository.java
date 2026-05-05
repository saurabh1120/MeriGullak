package com.MeiGullak.SavingApp.repository;

import com.MeiGullak.SavingApp.entity.SplitExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface SplitExpenseRepository
        extends JpaRepository<SplitExpense, Long> {

    List<SplitExpense> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    @Query("SELECT COALESCE(SUM(e.totalAmount), 0) " +
            "FROM SplitExpense e WHERE e.group.id = :groupId")
    BigDecimal getTotalByGroupId(@Param("groupId") Long groupId);
}