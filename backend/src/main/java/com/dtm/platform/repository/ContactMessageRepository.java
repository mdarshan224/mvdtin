package com.dtm.platform.repository;import com.dtm.platform.entity.ContactMessage;import org.springframework.data.jpa.repository.*;
public interface ContactMessageRepository extends JpaRepository<ContactMessage,Long>,JpaSpecificationExecutor<ContactMessage> { java.util.Optional<ContactMessage> findBySubmissionKey(String key); }
