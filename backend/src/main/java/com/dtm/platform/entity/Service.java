package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="services",indexes=@Index(name="idx_services_published_order",columnList="published,sort_order")) public class Service extends ContentRecord {  }
