package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="roles") public class Role { @Id @Column(length=16) public String name; public Role(){} public Role(String name){this.name=name;} }
