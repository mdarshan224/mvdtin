package com.dtm.platform.security;

import com.dtm.platform.exception.ApiException;
import org.springframework.http.HttpStatus;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Set;
import java.util.Arrays;
import java.util.stream.Collectors;

public final class OtpIdentity {
    private OtpIdentity() {}
    public static String normalize(String value) {
        if (value == null || value.length() > 24) throw invalid();
        var matcher = java.util.regex.Pattern.compile("^(?:\\+?91)?([6-9][0-9]{9})$").matcher(value.replaceAll("[\\s()-]", ""));
        if (!matcher.matches()) throw invalid();
        return matcher.group(1);
    }
    private static ApiException invalid() { return new ApiException(HttpStatus.BAD_REQUEST, "Enter a valid Indian mobile number."); }
    public static String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException("SHA-256 unavailable"); }
    }
    public static Set<String> allowed(String configured) {
        return Arrays.stream(configured.split(",")).map(String::trim).filter(x -> !x.isEmpty()).map(OtpIdentity::normalize).collect(Collectors.toUnmodifiableSet());
    }
    public static String mask(String phone) { return "••••••" + phone.substring(6); }
}
