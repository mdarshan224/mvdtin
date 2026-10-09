package com.dtm.platform.config;
import com.dtm.platform.service.*;import com.dtm.platform.dto.*;import com.dtm.platform.repository.*;import com.dtm.platform.entity.*;import com.fasterxml.jackson.databind.*;import org.springframework.boot.*;import org.springframework.stereotype.Component;import org.springframework.beans.factory.annotation.Value;import org.springframework.core.io.ClassPathResource;import org.springframework.security.crypto.password.PasswordEncoder;import org.springframework.transaction.annotation.Transactional;import java.util.*;
@Component public class SeedContent implements ApplicationRunner {
 private final ContentService content;private final ObjectMapper json;private final UserRepository users;private final RoleRepository roles;private final PasswordEncoder passwords;
 @Value("${app.seed}") boolean seed;@Value("${app.bootstrap-email}") String email;@Value("${app.bootstrap-password}") String password;
 public SeedContent(ContentService content,ObjectMapper json,UserRepository users,RoleRepository roles,PasswordEncoder passwords){this.content=content;this.json=json;this.users=users;this.roles=roles;this.passwords=passwords;}
 @Override @Transactional public void run(ApplicationArguments args)throws Exception{
  for(String name:List.of("ADMIN","EDITOR"))if(!roles.existsById(name))roles.save(new Role(name));
  if(!email.isBlank()&&!password.isBlank()&&users.findByEmail(email.toLowerCase(Locale.ROOT)).isEmpty()){if(password.length()<14||password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72)throw new IllegalArgumentException("Bootstrap password must have at least 14 characters");User user=new User();user.email=email.toLowerCase(Locale.ROOT);user.passwordHash=passwords.encode(password);user.roles.add(roles.findById("ADMIN").orElseThrow());users.save(user);}
  if(!seed||content.repository("settings").count()>0)return;
  JsonNode records=json.readTree(new ClassPathResource("seed/content.json").getInputStream());
  // Seed reference tables first, then projects to establish real JPA join rows.
  for(String resource:List.of("companies","categories","technologies","profile","skills","experience","education","services","timeline","resume","projects","settings"))for(JsonNode node:records)if(resource.equals(node.path("resource").asText()))content.save(resource,null,json.treeToValue(node,ContentInput.class));
 }
}
