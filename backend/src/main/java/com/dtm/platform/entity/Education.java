package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="education",indexes=@Index(name="idx_education_published_order",columnList="published,sort_order")) public class Education extends ContentRecord {  }
