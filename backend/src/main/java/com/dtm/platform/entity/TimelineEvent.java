package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="timeline_events",indexes=@Index(name="idx_timeline_events_published_order",columnList="published,sort_order")) public class TimelineEvent extends ContentRecord {  }
