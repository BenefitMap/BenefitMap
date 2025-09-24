package com.benefitmap.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import com.benefitmap.backend.auth.RefreshToken;
import com.benefitmap.backend.auth.RefreshTokenRepository;
import com.benefitmap.backend.auth.JwtProvider;
import com.benefitmap.backend.user.User;
import com.benefitmap.backend.user.UserRepository;
import com.benefitmap.backend.user.UserStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "로그인/토큰/로그아웃 API")
public class AuthController {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @Operation(
            summary = "액세스 토큰 재발급",
            description = "브라우저의 REFRESH_TOKEN 쿠키를 검증해 ACCESS_TOKEN을 새로 발급합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "재발급 성공",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = RefreshOk.class))),
                    @ApiResponse(responseCode = "401", description = "리프레시 토큰 없음/만료/무효", content = @Content)
            }
    )
    @PostMapping("/refresh")
    @Transactional(readOnly = true)
    public ResponseEntity<?> refresh(HttpServletRequest req) {
        // 1) 쿠키에서 refresh 추출
        String refresh = readCookie(req, "REFRESH_TOKEN");
        if (refresh == null || refresh.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing refresh");
        }

        // 2) 해시로 DB 조회 + 만료 확인
        String hash = sha256Hex(refresh);
        Optional<RefreshToken> opt = refreshTokenRepository.findByTokenHash(hash);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh");
        }
        RefreshToken saved = opt.get();
        if (saved.getExpiresAt() == null || saved.getExpiresAt().isBefore(Instant.now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Expired refresh");
        }

        // 3) 유저를 명시적으로 다시 조회 (LAZY 안전)
        Long userId = saved.getUser().getId();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User not active");
        }

        // 4) ACCESS_TOKEN 재발급 후 쿠키로 반환
        String newAccess = jwtProvider.createAccessToken(user.getId(), user.getRole().name());
        ResponseCookie atCookie = ResponseCookie.from("ACCESS_TOKEN", newAccess)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("None")
                .path("/")
                .maxAge(jwtProvider.getAccessTtlSeconds())
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, atCookie.toString())
                .body(new RefreshOk(true));
    }

    @Operation(
            summary = "로그아웃",
            description = "현재 기기의 REFRESH_TOKEN을 무효화하고, ACCESS_TOKEN/REFRESH_TOKEN 쿠키를 즉시 만료합니다.",
            security = @SecurityRequirement(name = "cookieAuth"),
            responses = {
                    @ApiResponse(responseCode = "204", description = "로그아웃 완료"),
                    @ApiResponse(responseCode = "401", description = "인증 필요", content = @Content)
            }
    )
    @PostMapping("/logout")
    @Transactional // ★ 삭제 쿼리 트랜잭션 보장
    public ResponseEntity<Void> logout(HttpServletRequest req) {
        try {
            String refresh = readCookie(req, "REFRESH_TOKEN");
            if (refresh != null && !refresh.isBlank()) {
                refreshTokenRepository.deleteByTokenHash(sha256Hex(refresh));
            }
        } catch (Exception ignore) {
            // 과제용: 삭제 실패해도 쿠키만 비우고 성공 처리
        }

        ResponseCookie expiredAccess  = expiredCookie("ACCESS_TOKEN");
        ResponseCookie expiredRefresh = expiredCookie("REFRESH_TOKEN");

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, expiredAccess.toString())
                .header(HttpHeaders.SET_COOKIE, expiredRefresh.toString())
                .build();
    }

    // ---- 문서용 간단 응답 DTO ----
    record RefreshOk(boolean ok) {}

    // ---- 내부 유틸 ----
    private static String readCookie(HttpServletRequest req, String name) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) if (name.equals(c.getName())) return c.getValue();
        return null;
    }

    private static String sha256Hex(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(s.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(d.length * 2);
            for (byte b : d) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private ResponseCookie expiredCookie(String name) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("None")
                .path("/")
                .maxAge(0)
                .build();
    }
}
