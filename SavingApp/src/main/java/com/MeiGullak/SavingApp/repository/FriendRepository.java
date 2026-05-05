package com.MeiGullak.SavingApp.repository;

import com.MeiGullak.SavingApp.entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FriendRepository extends JpaRepository<Friend, Long> {

    @Query("SELECT f FROM Friend f WHERE " +
            "(f.requester.id = :userId OR f.receiver.id = :userId) " +
            "AND f.status = 'ACCEPTED'")
    List<Friend> findAcceptedFriends(@Param("userId") Long userId);

    @Query("SELECT f FROM Friend f WHERE " +
            "f.receiver.id = :userId AND f.status = 'PENDING'")
    List<Friend> findPendingRequests(@Param("userId") Long userId);

    @Query("SELECT f FROM Friend f WHERE " +
            "((f.requester.id = :u1 AND f.receiver.id = :u2) OR " +
            "(f.requester.id = :u2 AND f.receiver.id = :u1))")
    Optional<Friend> findBetweenUsers(
            @Param("u1") Long u1, @Param("u2") Long u2);
}