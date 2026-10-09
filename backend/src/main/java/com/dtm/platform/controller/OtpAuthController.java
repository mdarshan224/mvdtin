package com.dtm.platform.controller;

import com.dtm.platform.service.OtpService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import java.time.Instant;
import java.util.*;

@RestController @RequestMapping("/api/v1/auth/otp")
public class OtpAuthController {
    private final OtpService service;private final JwtEncoder encoder;private final String issuer;
    public OtpAuthController(OtpService service,JwtEncoder encoder,@Value("${app.jwt-issuer}") String issuer){this.service=service;this.encoder=encoder;this.issuer=issuer;}
    public record Mobile(@NotBlank @Size(max=24) String mobile) {}
    public record Resend(@NotBlank @Size(max=24) String mobile,@NotBlank @Pattern(regexp="[a-f0-9-]{36}") String challengeId) {}
    public record Verify(@NotBlank @Size(max=24) String mobile,@NotBlank @Pattern(regexp="[a-f0-9-]{36}") String challengeId,@NotBlank @Pattern(regexp="[0-9]{6}") String otp) {}
    @PostMapping("/send") @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public OtpService.Challenge send(@Valid @RequestBody Mobile input){return service.send(input.mobile());}
    @PostMapping("/resend") public OtpService.Challenge resend(@Valid @RequestBody Resend input){return service.resend(input.mobile(),input.challengeId());}
    @PostMapping("/verify") public Map<String,Object> verify(@Valid @RequestBody Verify input){
        var principal=service.verify(input.mobile(),input.challengeId(),input.otp());var now=Instant.now();
        var claims=JwtClaimsSet.builder().issuer(issuer).subject(principal.subject()).issuedAt(now).expiresAt(now.plusSeconds(1800)).claim("roles",List.of("ADMIN")).claim("authMethod","otp").claim("displayName",principal.displayName()).build();
        var token=encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(),claims)).getTokenValue();
        return Map.of("accessToken",token,"expiresIn",1800,"mode","spring-jwt","user",Map.of("email","","displayName",principal.displayName(),"roles",List.of("ADMIN")));
    }
}
