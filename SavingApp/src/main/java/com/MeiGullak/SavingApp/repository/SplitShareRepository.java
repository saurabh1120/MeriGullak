package com.MeiGullak.SavingApp.repository;

import com.MeiGullak.SavingApp.entity.SplitShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface SplitShareRepository
        extends JpaRepository<SplitShare, Long> {

    List<SplitShare> findByExpenseId(Long expenseId);

    List<SplitShare> findByUserId(Long userId);

    @Query("SELECT s FROM SplitShare s " +
            "WHERE s.expense.group.id = :groupId " +
            "AND s.user.id = :userId AND s.settled = false")
    List<SplitShare> findUnsettledByGroupAndUser(
            @Param("groupId") Long groupId,
            @Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(s.shareAmount), 0) " +
            "FROM SplitShare s WHERE s.expense.group.id = :groupId " +
            "AND s.user.id = :userId AND s.settled = false")
    BigDecimal getUnsettledAmountByGroupAndUser(
            @Param("groupId") Long groupId,
            @Param("userId") Long userId);
}