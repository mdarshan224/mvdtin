package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="project_technologies",uniqueConstraints=@UniqueConstraint(columnNames={"project_id","technology_id"})) public class ProjectTechnology {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="project_id") public Project project;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="technology_id") public Technology technology;
}
