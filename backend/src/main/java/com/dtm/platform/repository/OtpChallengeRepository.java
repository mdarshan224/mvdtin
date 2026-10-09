package com.dtm.platform.repository;

import com.dtm.platform.entity.OtpChallenge;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface OtpChallengeRepository extends JpaRepository<OtpChallenge,String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from OtpChallenge c where c.phoneHash=:hash")
    Optional<OtpChallenge> findLocked(@Param("hash") String hash);
}
