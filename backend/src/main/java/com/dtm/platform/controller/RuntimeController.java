package com.dtm.platform.controller;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController public class RuntimeController {@GetMapping("/api/v1/runtime") public Map<String,Object> runtime(){return Map.of("mode","spring-jwt","database","Relational SQL / JPA","version","1.0.0");}}
