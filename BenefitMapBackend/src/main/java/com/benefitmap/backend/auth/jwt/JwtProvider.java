package com.benefitmap.backend.auth.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/**
 * JWT 발급/검증 프로바이더.
 * - 환경값: app.jwt.secret, app.jwt.access-exp-seconds, app.jwt.refresh-exp-seconds
 * - subject에는 userId만 사용, HS256 서명.
 */
@Component
public class JwtProvider {

    private final String secret;
    private final long accessTtl;   // 초 단위
    private final long refreshTtl;  // 초 단위

    private SecretKey key;

    public JwtProvider(@Value("${app.jwt.secret}") String secret,
                       @Value("${app.jwt.access-exp-seconds}") long accessTtl,
                       @Value("${app.jwt.refresh-exp-seconds}") long refreshTtl) {
        this.secret = secret;
        this.accessTtl = accessTtl;
        this.refreshTtl = refreshTtl;
    }

    /** 시작 시 서명 키 초기화 */
    @PostConstruct
    void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public long getAccessTtlSeconds()  { return accessTtl; }
    public long getRefreshTtlSeconds() { return refreshTtl; }

    /** 액세스 토큰 생성 (role 최소 클레임 포함) */
    public String createAccessToken(Long userId, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTtl)))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    /** 리프레시 토큰 생성 (type=refresh 포함) */
    public String createRefreshToken(Long userId, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("type", "refresh")
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(refreshTtl)))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    /** 서명/만료 검증 후 파싱 */
    public Jws<Claims> parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
    }
}
