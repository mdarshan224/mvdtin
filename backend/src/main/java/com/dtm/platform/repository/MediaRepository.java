package com.dtm.platform.repository;import com.dtm.platform.entity.Media;import org.springframework.data.jpa.repository.*;
public interface MediaRepository extends JpaRepository<Media,Long>,JpaSpecificationExecutor<Media> {  }
