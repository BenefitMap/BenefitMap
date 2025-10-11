package com.benefitmap.backend.auth.oauth;

import com.benefitmap.backend.auth.jwt.JwtProvider;
import com.benefitmap.backend.auth.token.RefreshToken;
import com.benefitmap.backend.auth.token.RefreshTokenRepository;
import com.benefitmap.backend.user.entity.User;
import com.benefitmap.backend.user.enums.Role;
import com.benefitmap.backend.user.enums.UserStatus;
import com.benefitmap.backend.user.repo.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;

/**
 * OAuth2 로그인 성공 처리
 * - 사용자 upsert
 * - access/refresh JWT 발급
 * - 보안 쿠키 설정 후 프론트 리다이렉트
 */
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements org.springframework.security.web.authentication.AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProvider jwtProvider;

    /** 로그인 성공 후 프론트 리다이렉트 URL */
    @Value("${app.oauth2.redirect:http://localhost:5173/oauth2/callback}")
    private String redirectUrl;

    /** HTTPS 환경 권장: true → Secure 쿠키 + SameSite=None */
    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        // 1) OAuth2 인증 타입 확인
        if (!(authentication instanceof OAuth2AuthenticationToken oauth2)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Not OAuth2 auth");
            return;
        }

        // 2) 프로필 추출
        OAuth2User principal = oauth2.getPrincipal();
        Map<String, Object> attr = principal.getAttributes();

        String provider = normalizeProvider(oauth2.getAuthorizedClientRegistrationId());
        String sub      = Objects.toString(attr.get("sub"), null);
        String email    = Objects.toString(attr.get("email"), null);
        String name     = Objects.toString(attr.get("name"), "");
        String picture  = Objects.toString(attr.get("picture"), null);

        if (provider == null || sub == null || email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "OAuth profile insufficient");
            return;
        }

        // 3) 사용자 upsert (최초 로그인만 기본 role/status 설정)
        User user = userRepository.findByProviderAndProviderId(provider, sub)
                .map(u -> {
                    u.setEmail(email);
                    if (name != null) u.setName(name);
                    if (picture != null) u.setImageUrl(picture);
                    return u;
                })
                .orElseGet(() ->
                        User.builder()
                                .provider(provider)
                                .providerId(sub)
                                .email(email)
                                .name(name)
                                .imageUrl(picture)
                                .role(Role.ROLE_USER)
                                .status(UserStatus.PENDING)
                                .build()
                );

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        // 4) JWT 발급
        String accessToken  = jwtProvider.createAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtProvider.createRefreshToken(user.getId(), user.getRole().name());

        // 5) refresh 토큰 해시 저장(DB)
        String tokenHash = sha256Hex(refreshToken);
        refreshTokenRepository.save(
                RefreshToken.builder()
                        .user(user)
                        .tokenHash(tokenHash)
                        .expiresAt(Instant.now().plusSeconds(jwtProvider.getRefreshTtlSeconds()))
                        .build()
        );

        // 6) 쿠키 생성 (HTTPOnly, 경로=/, SameSite 정책)
        String sameSite = cookieSecure ? "None" : "Lax";
        ResponseCookie accessCookie  = buildCookie("ACCESS_TOKEN", accessToken,  jwtProvider.getAccessTtlSeconds(), sameSite);
        ResponseCookie refreshCookie = buildCookie("REFRESH_TOKEN", refreshToken, jwtProvider.getRefreshTtlSeconds(), sameSite);

        // 7) 쿠키 헤더 추가 및 리다이렉트
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        response.sendRedirect(redirectUrl);
    }

    private static String normalizeProvider(String id) {
        if (id == null) return null;
        return id.toLowerCase();
    }

    private ResponseCookie buildCookie(String name, String value, long maxAgeSeconds, String sameSite) {
        // 개발(HTTP): Secure=false / SameSite=Lax
        // 운영(HTTPS): Secure=true / SameSite=None
        return ResponseCookie.from(name, value)
                .path("/")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .maxAge(maxAgeSeconds)
                .build();
    }

    /** refresh 토큰 저장용 SHA-256 해시 */
    private static String sha256Hex(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(s.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(d.length * 2);
            for (byte b : d) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
