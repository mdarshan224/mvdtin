package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="projects",indexes=@Index(name="idx_projects_published_order",columnList="published,sort_order")) public class Project extends ContentRecord { @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="company_id") public Company company;
@OneToMany(mappedBy="project",cascade=CascadeType.ALL,orphanRemoval=true) public java.util.List<ProjectTechnology> technologies=new java.util.ArrayList<>(); }
