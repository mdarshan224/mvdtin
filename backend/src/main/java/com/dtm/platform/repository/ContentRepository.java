package com.dtm.platform.repository;import com.dtm.platform.entity.ContentRecord;import org.springframework.data.jpa.repository.*;import org.springframework.data.repository.NoRepositoryBean;import java.util.Optional;
@NoRepositoryBean public interface ContentRepository<T extends ContentRecord> extends JpaRepository<T,Long>,JpaSpecificationExecutor<T> {Optional<T> findBySlug(String slug);}
