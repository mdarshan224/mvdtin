package com.dtm.platform.repository;import com.dtm.platform.entity.User;import org.springframework.data.jpa.repository.*;
public interface UserRepository extends JpaRepository<User,Long>,JpaSpecificationExecutor<User> { java.util.Optional<User> findByEmail(String email); }
