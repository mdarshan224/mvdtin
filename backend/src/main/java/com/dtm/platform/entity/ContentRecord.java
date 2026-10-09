package com.dtm.platform.entity;
import jakarta.persistence.*;import java.time.Instant;
@MappedSuperclass public abstract class ContentRecord {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false,length=180) public String name;
 @Column(nullable=false,unique=true,length=180) public String slug;
 @Column(nullable=false,length=3000) public String summary="";
 @Column(nullable=false,length=100) public String category="";
 @Column(nullable=false,length=32) public String status="CONCEPT";
 @Column(nullable=false) public boolean published=false;
 @Column(nullable=false) public boolean featured=false;
 @Column(nullable=false) public int sortOrder=0;
 @Column(nullable=false,columnDefinition="TEXT") public String body="{}";
 @Column(nullable=false) public Instant createdAt=Instant.now();
 @Column(nullable=false) public Instant updatedAt=Instant.now();
 @Version public Long version=0L;
 @PreUpdate void updateTime(){updatedAt=Instant.now();}
}
