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
 * JWT 발급·검증 유틸
 * - subject = userId
 * - HS256 서명
 * - TTL: access/refresh 환경변수 기반
 */
@Component
public class JwtProvider {

    private final String secret;
    private final long accessTtl;   // access token 만료(초)
    private final long refreshTtl;  // refresh token 만료(초)

    private SecretKey key;

    public JwtProvider(@Value("${app.jwt.secret}") String secret,
                       @Value("${app.jwt.access-exp-seconds}") long accessTtl,
                       @Value("${app.jwt.refresh-exp-seconds}") long refreshTtl) {
        this.secret = secret;
        this.accessTtl = accessTtl;
        this.refreshTtl = refreshTtl;
    }

    /** 앱 시작 시 서명키 초기화 */
    @PostConstruct
    void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public long getAccessTtlSeconds()  { return accessTtl; }
    public long getRefreshTtlSeconds() { return refreshTtl; }

    /** 액세스 토큰 생성 (role 클레임 포함) */
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

    /** 리프레시 토큰 생성 (type=refresh 클레임 포함) */
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

    /** 토큰 파싱 + 서명/만료 검증 */
    public Jws<Claims> parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
    }
}
