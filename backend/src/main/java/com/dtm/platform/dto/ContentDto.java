package com.dtm.platform.dto;import java.time.Instant;import java.util.Map;
public record ContentDto(Long id,String resource,String name,String slug,String summary,String category,String status,boolean published,boolean featured,int sortOrder,Map<String,Object> data,Instant createdAt,Instant updatedAt,Long version) {}
