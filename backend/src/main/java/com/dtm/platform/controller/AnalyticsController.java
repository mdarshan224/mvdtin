package com.dtm.platform.controller;import com.dtm.platform.service.*;import org.springframework.web.bind.annotation.*;import org.springframework.security.access.prepost.PreAuthorize;import java.util.*;
@RestController @RequestMapping("/api/v1") public class AnalyticsController {
 private final AnalyticsService analytics;public AnalyticsController(AnalyticsService analytics){this.analytics=analytics;}
 public record EventInput(String eventType,String resource,boolean consent){}
 @PostMapping("/analytics/events") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT) public void event(@RequestBody EventInput e){analytics.record(e.eventType(),e.resource(),e.consent());}
 @GetMapping({"/admin/analytics","/analytics"}) @PreAuthorize("hasRole('ADMIN')") public Map<String,Object> summary(@RequestParam(defaultValue="30")int days){return analytics.summary(days);}
 @DeleteMapping("/admin/analytics/expired") @PreAuthorize("hasRole('ADMIN')") public Map<String,Integer> purge(){return Map.of("deleted",analytics.purge());}
}
