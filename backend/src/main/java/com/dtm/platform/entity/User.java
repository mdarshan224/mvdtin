package com.dtm.platform.entity;import jakarta.persistence.*;import java.util.*;
@Entity @Table(name="users") public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(unique=true,nullable=false,length=254) public String email;
 @Column(nullable=false,length=100) public String passwordHash;
 @Column(nullable=false) public boolean enabled=true;
 @ManyToMany(fetch=FetchType.EAGER) @JoinTable(name="user_roles",joinColumns=@JoinColumn(name="user_id"),inverseJoinColumns=@JoinColumn(name="role_name")) public Set<Role> roles=new HashSet<>();
 public java.time.Instant createdAt=java.time.Instant.now();
}
