package com.dtm.platform.mapper;import com.dtm.platform.entity.*;import com.dtm.platform.dto.*;import com.fasterxml.jackson.databind.*;import com.fasterxml.jackson.core.type.TypeReference;import org.springframework.stereotype.Component;import java.util.Map;
@Component public class ContentMapper {
 private final ObjectMapper json;public ContentMapper(ObjectMapper json){this.json=json;}
 public Map<String,Object> data(ContentRecord row){try{return json.readValue(row.body,new TypeReference<>(){});}catch(Exception e){throw new IllegalStateException("Invalid stored content",e);}}
 public ContentDto dto(String resource,ContentRecord row){return new ContentDto(row.id,resource,row.name,row.slug,row.summary,row.category,row.status,row.published,row.featured,row.sortOrder,data(row),row.createdAt,row.updatedAt,row.version);}
 public void apply(ContentRecord row,ContentInput in){row.name=in.name();row.slug=in.slug();row.summary=in.summary()==null?"":in.summary();row.category=in.category()==null?"":in.category();row.status=in.status();row.published=in.published();row.featured=in.featured();row.sortOrder=in.sortOrder();try{row.body=json.writeValueAsString(in.data()==null?Map.of():in.data());}catch(Exception e){throw new IllegalArgumentException("Invalid content data");}}
}
