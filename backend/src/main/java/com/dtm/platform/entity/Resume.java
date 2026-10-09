package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="resumes",indexes=@Index(name="idx_resumes_published_order",columnList="published,sort_order")) public class Resume extends ContentRecord { @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="media_id") public Media media; }
