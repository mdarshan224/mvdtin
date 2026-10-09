package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="companies",indexes=@Index(name="idx_companies_published_order",columnList="published,sort_order")) public class Company extends ContentRecord {  }
