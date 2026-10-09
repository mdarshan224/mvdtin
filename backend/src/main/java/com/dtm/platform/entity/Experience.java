package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="experience",indexes=@Index(name="idx_experience_published_order",columnList="published,sort_order")) public class Experience extends ContentRecord { @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="company_id") public Company company; }
