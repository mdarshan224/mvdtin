package com.dtm.platform.service;

import com.dtm.platform.entity.OtpChallenge;
import com.dtm.platform.repository.OtpChallengeRepository;
import com.dtm.platform.security.OtpIdentity;
import com.dtm.platform.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.time.Instant;
import java.util.*;

@Service
public class OtpService {
    private final OtpChallengeRepository records;
    private final Fast2SmsClient provider;
    private final TransactionTemplate transactions;
    private final Set<String> allowed;
    public OtpService(OtpChallengeRepository records,Fast2SmsClient provider,PlatformTransactionManager manager,@Value("${app.otp.allowed-phones:}") String phones) {
        this.records=records;this.provider=provider;this.transactions=new TransactionTemplate(manager);this.allowed=OtpIdentity.allowed(phones);
    }
    public record Challenge(String challengeId,String maskedMobile,long expiresIn,int resendAfter) {}
    public record Principal(String subject,String displayName) {}
    private String phone(String input) { var phone=OtpIdentity.normalize(input);if(!allowed.contains(phone))throw new ApiException(HttpStatus.FORBIDDEN,"Access is restricted to authorized administrators.");return phone; }
    private void delivery(OtpChallenge record,Instant now) {
        long window=now.getEpochSecond()/3600;
        if(record.deliveryWindow!=window){record.deliveryWindow=window;record.deliveries=0;}
        if(record.deliveries>=6)throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Too many code requests. Please try again later.");
        record.deliveries++;
    }
    public Challenge send(String input) {
        var phone=phone(input);var hash=OtpIdentity.hash(phone);var now=Instant.now();
        var state=transactions.execute(status->{
            var record=records.findLocked(hash).orElseGet(()->{var x=new OtpChallenge();x.phoneHash=hash;return x;});
            if(record.lastSentAt!=null&&record.lastSentAt.isAfter(now.minusSeconds(60)))throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Wait 60 seconds before requesting another code.");
            delivery(record,now);record.challengeId=UUID.randomUUID().toString();record.createdAt=now;record.expiresAt=now.plusSeconds(300);record.lastSentAt=now;record.attempts=0;record.resends=0;record.consumed=false;
            records.saveAndFlush(record);return new Challenge(record.challengeId,OtpIdentity.mask(phone),300,60);
        });
        try{provider.send(phone);}catch(ApiException e){transactions.executeWithoutResult(status->{records.findLocked(hash).filter(x->x.challengeId.equals(state.challengeId())).ifPresent(x->{x.consumed=true;records.saveAndFlush(x);});});throw e;}
        return state;
    }
    private OtpChallenge active(String hash,String challengeId,Instant now) {
        var record=records.findLocked(hash).orElseThrow(()->expired());
        if(record.consumed||!record.challengeId.equals(challengeId)||!record.expiresAt.isAfter(now))throw expired();
        return record;
    }
    private ApiException expired(){return new ApiException(HttpStatus.BAD_REQUEST,"This code has expired or was used. Request a new code.");}
    public Challenge resend(String input,String challengeId) {
        var phone=phone(input);var hash=OtpIdentity.hash(phone);var now=Instant.now();
        var state=transactions.execute(status->{
            var record=active(hash,challengeId,now);
            if(record.attempts>=5||record.resends>=3||record.lastSentAt.isAfter(now.minusSeconds(60)))throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Wait 60 seconds before resending, or request a new code after expiry.");
            delivery(record,now);record.resends++;record.lastSentAt=now;records.saveAndFlush(record);
            return new Challenge(record.challengeId,OtpIdentity.mask(phone),Math.max(0,record.expiresAt.getEpochSecond()-now.getEpochSecond()),60);
        });
        provider.resend(phone);return state;
    }
    public Principal verify(String input,String challengeId,String otp) {
        var phone=phone(input);var hash=OtpIdentity.hash(phone);
        if(otp==null||!otp.matches("[0-9]{6}"))throw new ApiException(HttpStatus.BAD_REQUEST,"Enter the six-digit code.");
        // Commit the attempt before the network call, so failed verification
        // cannot roll back the counter. The provider owns the OTP itself.
        transactions.executeWithoutResult(status->{
            var record=active(hash,challengeId,Instant.now());
            if(record.attempts>=5)throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Too many attempts. Request a new code after expiry.");
            record.attempts++;records.saveAndFlush(record);
        });
        provider.verify(phone,otp);
        transactions.executeWithoutResult(status->{var record=active(hash,challengeId,Instant.now());record.consumed=true;records.saveAndFlush(record);});
        return new Principal("otp:"+hash,OtpIdentity.mask(phone));
    }
}
