package com.dtm.platform.entity;import jakarta.persistence.*;import java.time.Instant;
@Entity @Table(name="contact_messages",indexes=@Index(name="idx_contacts_status_created",columnList="status,created_at")) public class ContactMessage {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false,length=120) public String name;
 @Column(nullable=false,length=254) public String email;
 @Column(length=40) public String phone;
 @Column(length=180) public String company;
 @Column(length=100) public String projectType;
 @Column(length=100) public String budget;
 @Column(nullable=false,length=5000) public String message;
 @Column(nullable=false,length=24) public String status="NEW";
 @Column(unique=true,length=80) public String submissionKey;
 @Column(nullable=false) public Instant createdAt=Instant.now();
 @Version public Long version=0L;
}
