package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="skills",indexes=@Index(name="idx_skills_published_order",columnList="published,sort_order")) public class Skill extends ContentRecord {  }
