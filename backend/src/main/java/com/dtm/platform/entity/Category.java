package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="categories",indexes=@Index(name="idx_categories_published_order",columnList="published,sort_order")) public class Category extends ContentRecord {  }
