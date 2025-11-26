package com.benefitmap.backend.auth.controller;

import com.benefitmap.backend.common.api.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import com.benefitmap.backend.auth.token.RefreshToken;
import com.benefitmap.backend.auth.token.RefreshTokenRepository;
import com.benefitmap.backend.auth.jwt.JwtProvider;
import com.benefitmap.backend.user.entity.User;
import com.benefitmap.backend.user.repo.UserRepository;
import com.benefitmap.backend.user.enums.UserStatus;
import com.benefitmap.backend.web.dto.RefreshResult;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Optional;

/**
 * 인증 API 컨트롤러
 * - /auth/refresh: REFRESH_TOKEN 검증 후 ACCESS_TOKEN 재발급
 * - /auth/logout : REFRESH_TOKEN 무효화 및 관련 쿠키 만료
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "로그인/토큰/로그아웃 API")
public class AuthController {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    /** HTTPS 환경 권장 여부(true면 Secure 쿠키 + SameSite=None) */
    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    // ========================================================================
    // 액세스 토큰 재발급
    // ========================================================================
    /**
     * 액세스 토큰 재발급
     * - 브라우저의 REFRESH_TOKEN 쿠키를 검증해 새로운 ACCESS_TOKEN 발급
     * @param req HTTP 요청(쿠키 포함)
     * @return 재발급 결과를 ApiResponse로 반환
     */
    @Operation(
            summary = "액세스 토큰 재발급",
            description = "브라우저의 REFRESH_TOKEN 쿠키를 검증하여 새로운 ACCESS_TOKEN을 발급합니다.",
            security = { @SecurityRequirement(name = "") }, // 전역 cookieAuth 제외
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "재발급 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = @ExampleObject(
                                            name = "재발급 성공",
                                            value = """
                                            {
                                              "success": true,
                                              "message": "access token reissued",
                                              "data": { "ok": true },
                                              "timestamp": "2025-09-24T00:00:00Z"
                                            }
                                            """
                                    )
                            )
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "401",
                            description = "리프레시 토큰 누락/유효하지 않음/만료됨",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = @ExampleObject(
                                            name = "리프레시실패",
                                            value = """
                                            {
                                              "success": false,
                                              "message": "Missing refresh",
                                              "data": null,
                                              "timestamp": "2025-09-24T00:00:00Z"
                                            }
                                            """
                                    )
                            )
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "403",
                            description = "사용자가 활성 상태가 아님",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = @ExampleObject(
                                            name = "사용자비활성",
                                            value = """
                                            {
                                              "success": false,
                                              "message": "User suspended",
                                              "data": null,
                                              "timestamp": "2025-09-24T00:00:00Z"
                                            }
                                            """
                                    )
                            )
                    )
            }
    )
    @PostMapping("/refresh")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<RefreshResult>> refresh(HttpServletRequest req) {
        // 1) REFRESH_TOKEN 쿠키 추출
        String refresh = readCookie(req, "REFRESH_TOKEN");
        if (refresh == null || refresh.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Missing refresh"));
        }

        // 2) 해시 조회 및 만료 확인
        String hash = sha256Hex(refresh);
        Optional<RefreshToken> opt = refreshTokenRepository.findByTokenHash(hash);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Invalid refresh"));
        }
        RefreshToken saved = opt.get();
        if (saved.getExpiresAt() == null || saved.getExpiresAt().isBefore(Instant.now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Expired refresh"));
        }

        // 3) 사용자 조회 및 상태 확인
        Long userId = saved.getUser().getId();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("User not found"));
        }
        if (user.getStatus() == UserStatus.SUSPENDED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.fail("User suspended"));
        }

        // 4) ACCESS_TOKEN 재발급 및 쿠키 설정
        String newAccess = jwtProvider.createAccessToken(user.getId(), user.getRole().name());
        String sameSite = cookieSecure ? "None" : "Lax";
        ResponseCookie atCookie = ResponseCookie.from("ACCESS_TOKEN", newAccess)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(jwtProvider.getAccessTtlSeconds())
                .build();

        // 5) 응답 반환
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, atCookie.toString())
                .body(ApiResponse.ok("access token reissued", new RefreshResult(true)));
    }

    // ========================================================================
    // 로그아웃
    // ========================================================================
    /**
     * 로그아웃
     * - 현재 기기의 REFRESH_TOKEN을 무효화하고 ACCESS/REFRESH 쿠키를 만료
     * @param req HTTP 요청(쿠키 포함)
     * @return 처리 결과를 ApiResponse로 반환
     */
    @Operation(
            summary = "로그아웃",
            description = "현재 기기의 REFRESH_TOKEN을 무효화하고 ACCESS_TOKEN/REFRESH_TOKEN 쿠키를 즉시 만료합니다.",
            security = @SecurityRequirement(name = "cookieAuth"),
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "로그아웃 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = @ExampleObject(
                                            name = "로그아웃성공",
                                            value = """
                                            {
                                              "success": true,
                                              "message": "logout",
                                              "data": null,
                                              "timestamp": "2025-09-24T00:00:00Z"
                                            }
                                            """
                                    )
                            )
                    )
            }
    )
    @PostMapping("/logout")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest req) {
        try {
            // 1) REFRESH_TOKEN 쿠키 추출 후 DB 레코드 삭제
            String refresh = readCookie(req, "REFRESH_TOKEN");
            if (refresh != null && !refresh.isBlank()) {
                refreshTokenRepository.deleteByTokenHash(sha256Hex(refresh));
            }
        } catch (Exception ignore) {
            // 과제/데모 목적: 삭제 실패해도 쿠키 만료로 처리
        }

        // 2) ACCESS_TOKEN / REFRESH_TOKEN 쿠키 즉시 만료
        ResponseCookie expiredAccess  = expiredCookie("ACCESS_TOKEN");
        ResponseCookie expiredRefresh = expiredCookie("REFRESH_TOKEN");

        // 3) 응답 반환
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredAccess.toString())
                .header(HttpHeaders.SET_COOKIE, expiredRefresh.toString())
                .body(ApiResponse.ok("logout", null));
    }

    // ========================================================================
    // 내부 유틸리티
    // ========================================================================

    /** 요청에서 지정 이름의 쿠키 값을 읽음 */
    private static String readCookie(HttpServletRequest req, String name) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) if (name.equals(c.getName())) return c.getValue();
        return null;
    }

    /** 문자열을 SHA-256으로 해시하여 16진수 문자열로 반환 */
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

    /** 즉시 만료되는 쿠키 생성 */
    private ResponseCookie expiredCookie(String name) {
        String sameSite = cookieSecure ? "None" : "Lax";
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(0)
                .build();
    }
}
