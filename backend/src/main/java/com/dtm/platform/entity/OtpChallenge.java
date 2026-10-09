package com.dtm.platform.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="otp_challenges")
public class OtpChallenge {
    @Id @Column(name="phone_hash",length=64) public String phoneHash;
    @Column(name="challenge_id",nullable=false,unique=true,length=36) public String challengeId;
    @Column(name="created_at",nullable=false) public Instant createdAt;
    @Column(name="expires_at",nullable=false) public Instant expiresAt;
    @Column(name="last_sent_at",nullable=false) public Instant lastSentAt;
    @Column(nullable=false) public int attempts;
    @Column(nullable=false) public int resends;
    @Column(nullable=false) public boolean consumed;
    @Column(name="delivery_window",nullable=false) public long deliveryWindow;
    @Column(nullable=false) public int deliveries;
    @Version public long version;
}
