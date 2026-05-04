package com.MeiGullak.SavingApp.repository;

import com.MeiGullak.SavingApp.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserIdOrderByExpenseDateDescCreatedAtDesc(Long userId);

    List<Expense> findByUserIdAndAccountIdOrderByExpenseDateDesc(Long userId, Long accountId);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
            "AND e.expenseDate BETWEEN :start AND :end " +
            "ORDER BY e.expenseDate DESC")
    List<Expense> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
            "WHERE e.user.id = :userId AND e.transactionType = 'DEBIT' " +
            "AND e.expenseDate BETWEEN :start AND :end")
    BigDecimal getTotalExpenseByUserAndDateRange(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    Optional<Expense> findByIdAndUserId(Long id, Long userId);
}