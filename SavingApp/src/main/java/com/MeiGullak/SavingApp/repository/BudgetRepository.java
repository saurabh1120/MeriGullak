package com.MeiGullak.SavingApp.repository;

import com.MeiGullak.SavingApp.entity.Budget;
import com.MeiGullak.SavingApp.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdAndMonthAndYearAndActiveTrue(
            Long userId, int month, int year
    );

    Optional<Budget> findByUserIdAndCategoryAndMonthAndYear(
            Long userId,
            Expense.ExpenseCategory category,
            int month, int year
    );

    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
            "AND b.active = true ORDER BY b.year DESC, b.month DESC")
    List<Budget> findAllActiveByUserId(@Param("userId") Long userId);
}