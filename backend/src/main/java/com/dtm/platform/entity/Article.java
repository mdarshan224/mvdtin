package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="articles",indexes=@Index(name="idx_articles_published_order",columnList="published,sort_order")) public class Article extends ContentRecord { @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="category_id") public Category articleCategory;
@ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="author_id") public User author; }
