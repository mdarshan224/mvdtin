package com.dtm.platform.controller;import com.dtm.platform.service.*;import com.dtm.platform.dto.*;import com.dtm.platform.entity.*;import org.springframework.web.bind.annotation.*;import org.springframework.security.access.prepost.PreAuthorize;import jakarta.validation.Valid;import java.util.*;
@RestController @RequestMapping("/api/v1") public class ContactController {
 private final ContactService contacts;public ContactController(ContactService contacts){this.contacts=contacts;}
 @PostMapping("/contact") @ResponseStatus(org.springframework.http.HttpStatus.CREATED) public Map<String,Object> submit(@Valid @RequestBody ContactInput input){return contacts.submit(input);}
 @GetMapping("/admin/contact") @PreAuthorize("hasRole('ADMIN')") public PageDto<ContactMessage> list(@RequestParam(defaultValue="")String q,@RequestParam(required=false)String status,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="24")int size){return contacts.list(q,status,page,size);}
 public record StatusInput(String status,Long version){}
 @PatchMapping("/admin/contact/{id}") @PreAuthorize("hasRole('ADMIN')") public ContactMessage update(@PathVariable long id,@RequestBody StatusInput input){return contacts.update(id,input.status(),input.version());}
@DeleteMapping("/admin/contact/{id}") @PreAuthorize("hasRole('ADMIN')") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT) public void delete(@PathVariable long id){contacts.delete(id);}
}