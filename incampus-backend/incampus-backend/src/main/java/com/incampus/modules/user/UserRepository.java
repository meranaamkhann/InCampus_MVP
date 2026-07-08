package com.incampus.modules.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailAndDeletedFalse(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.deleted = false AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.college) LIKE LOWER(CONCAT('%', :query, '%')))")
    org.springframework.data.domain.Page<User> search(@Param("query") String query, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<User> findByCollegeAndDeletedFalse(String college, org.springframework.data.domain.Pageable pageable);
}
