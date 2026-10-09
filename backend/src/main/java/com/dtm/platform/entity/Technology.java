package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="technologies",indexes=@Index(name="idx_technologies_published_order",columnList="published,sort_order")) public class Technology extends ContentRecord { @OneToMany(mappedBy="technology") public java.util.List<ProjectTechnology> projectLinks=new java.util.ArrayList<>(); }
