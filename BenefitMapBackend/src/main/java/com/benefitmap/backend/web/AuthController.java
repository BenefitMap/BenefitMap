package com.benefitmap.backend.web;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import com.benefitmap.backend.auth.token.RefreshToken;
import com.benefitmap.backend.auth.token.RefreshTokenRepository;
import com.benefitmap.backend.auth.jwt.JwtProvider;
import com.benefitmap.backend.user.entity.User;
import com.benefitmap.backend.user.repo.UserRepository;
import com.benefitmap.backend.user.enums.UserStatus;
import com.benefitmap.backend.web.payload.RefreshResult;

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

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "로그인/토큰/로그아웃 API")
public class AuthController {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    /** HTTPS 권장: true → Secure 쿠키 + SameSite=None */
    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @Operation(
            // 전역 cookieAuth 제외(이 엔드포인트는 REFRESH_TOKEN만 필요)
            security = { @SecurityRequirement(name = "") },
            summary = "액세스 토큰 재발급",
            description = "브라우저의 REFRESH_TOKEN 쿠키를 검증하여 ACCESS_TOKEN을 재발급합니다.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "액세스 토큰 재발급 성공",
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
                                              "message": "User not active",
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

        // 2) 해시 조회 + 만료 확인
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

        // 3) 유저 재조회
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

        // 4) ACCESS_TOKEN 재발급(+ 쿠키)
        String newAccess = jwtProvider.createAccessToken(user.getId(), user.getRole().name());
        String sameSite = cookieSecure ? "None" : "Lax";

        ResponseCookie atCookie = ResponseCookie.from("ACCESS_TOKEN", newAccess)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(jwtProvider.getAccessTtlSeconds())
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, atCookie.toString())
                .body(ApiResponse.ok("access token reissued", new RefreshResult(true)));
    }

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
    @Transactional // 삭제 트랜잭션 보장
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest req) {
        try {
            String refresh = readCookie(req, "REFRESH_TOKEN");
            if (refresh != null && !refresh.isBlank()) {
                refreshTokenRepository.deleteByTokenHash(sha256Hex(refresh));
            }
        } catch (Exception ignore) {
            // 데모/과제: 삭제 실패해도 쿠키 만료로 처리
        }

        ResponseCookie expiredAccess  = expiredCookie("ACCESS_TOKEN");
        ResponseCookie expiredRefresh = expiredCookie("REFRESH_TOKEN");

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredAccess.toString())
                .header(HttpHeaders.SET_COOKIE, expiredRefresh.toString())
                .body(ApiResponse.ok("logout", null));
    }

    // ---- 내부 유틸 ----

    /** 쿠키 값 읽기 */
    private static String readCookie(HttpServletRequest req, String name) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) if (name.equals(c.getName())) return c.getValue();
        return null;
    }

    /** SHA-256 HEX 해시 */
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

    /** 만료 쿠키(즉시 삭제) */
    private ResponseCookie expiredCookie(String name) {
        // 로컬(HTTP)=Lax, 운영(HTTPS)=None 동일 적용
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
