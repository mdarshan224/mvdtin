package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="profiles",indexes=@Index(name="idx_profiles_published_order",columnList="published,sort_order")) public class Profile extends ContentRecord {  }
