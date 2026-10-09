package com.dtm.platform.entity;import jakarta.persistence.*;import java.time.Instant;
@Entity @Table(name="media") public class Media {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false,length=200) public String name;
 @Column(nullable=false,unique=true,length=100) public String storageKey;
 @Column(nullable=false,length=100) public String contentType;
 @Column(nullable=false) public long size;
 public Instant createdAt=Instant.now();
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="uploaded_by") public User uploadedBy;
}
