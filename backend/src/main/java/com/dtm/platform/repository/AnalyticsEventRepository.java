package com.dtm.platform.repository;import com.dtm.platform.entity.AnalyticsEvent;import org.springframework.data.jpa.repository.*;
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent,Long>,JpaSpecificationExecutor<AnalyticsEvent> {  }
