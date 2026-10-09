package com.dtm.platform.service;

import com.dtm.platform.exception.ApiException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.Map;

@Component
public class Fast2SmsClient {
    private final ObjectMapper json;
    private final String apiKey,otpId;
    private final HttpClient http=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).followRedirects(HttpClient.Redirect.NEVER).build();
    public Fast2SmsClient(ObjectMapper json,@Value("${app.otp.api-key:}") String apiKey,@Value("${app.otp.template-id:}") String otpId) { this.json=json;this.apiKey=apiKey;this.otpId=otpId; }
    public void send(String phone) { call("send",Map.of("mobile",phone,"otp_id",otpId,"otp_expiry",5,"otp_length",6)); }
    public void resend(String phone) { call("resend",Map.of("mobile",phone)); }
    public void verify(String phone,String otp) { call("verify",Map.of("mobile",phone,"otp",otp)); }
    private void call(String action,Map<String,Object> body) {
        if (apiKey.isBlank()||otpId.isBlank()) throw unavailable();
        try {
            var request=HttpRequest.newBuilder(URI.create("https://www.fast2sms.com/dev/otp/"+action)).timeout(Duration.ofSeconds(10)).header("Authorization",apiKey).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))).build();
            var result=http.send(request,HttpResponse.BodyHandlers.ofString());
            var data=json.readTree(result.body());
            boolean success=data.has("return")?data.path("return").isBoolean()&&data.path("return").booleanValue():data.has("success")?data.path("success").isBoolean()&&data.path("success").booleanValue():"success".equals(data.path("status").asText());
            if (result.statusCode()>=200&&result.statusCode()<300&&success) return;
            if (action.equals("verify")&&(result.statusCode()==400||result.statusCode()==404||result.statusCode()==200)) throw new ApiException(HttpStatus.BAD_REQUEST,"The code is incorrect, expired or already used.");
            if (action.equals("resend")&&(result.statusCode()==400||result.statusCode()==404)) throw new ApiException(HttpStatus.BAD_REQUEST,"This code cannot be resent. Request a new code.");
            throw unavailable();
        } catch (ApiException e) { throw e; }
        catch (InterruptedException e) { Thread.currentThread().interrupt();throw unavailable(); }
        catch (Exception e) { throw unavailable(); }
    }
    private ApiException unavailable() { return new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"SMS sign-in is temporarily unavailable. Please try again."); }
}
