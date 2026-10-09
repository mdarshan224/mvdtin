package com.dtm.platform.entity;import jakarta.persistence.*;import java.time.Instant;
@Entity @Table(name="analytics_events",indexes=@Index(name="idx_events_type_created",columnList="event_type,created_at")) public class AnalyticsEvent {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false,length=30) public String eventType;
 @Column(length=180) public String resource;
 @Column(nullable=false) public Instant createdAt=Instant.now();
}
