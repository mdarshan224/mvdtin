package com.dtm.platform.entity;import jakarta.persistence.*;
@Entity @Table(name="settings",indexes=@Index(name="idx_settings_published_order",columnList="published,sort_order")) public class Setting extends ContentRecord {  }
