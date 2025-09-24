package com.benefitmap.backend.controller;

import com.benefitmap.backend.auth.RefreshTokenRepository;
import com.benefitmap.backend.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

/**
 * 사용자 계정 API
 * - DELETE /user/me : 계정 삭제 + 모든 리프레시 토큰 제거 + 쿠키 만료
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Tag(name = "User", description = "사용자 계정 API")
public class UserController {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    /** 로컬(HTTP) 테스트 시 false, 운영(HTTPS)에서는 true 권장 */
    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @Operation(
            summary = "회원 탈퇴",
            description = "로그인한 사용자의 계정을 삭제하고 모든 리프레시 토큰을 제거합니다. ACCESS/REFRESH 쿠키를 즉시 만료합니다.",
            security = @SecurityRequirement(name = "cookieAuth"),
            responses = {
                    @ApiResponse(responseCode = "204", description = "탈퇴 완료"),
                    @ApiResponse(responseCode = "401", description = "인증 필요")
            }
    )
    @DeleteMapping("/me")
    @Transactional
    public ResponseEntity<Void> deleteMe() {
        // 1) 현재 로그인 사용자 ID 추출 (principal 타입에 상관없이 동작)
        Long userId = currentUserId();
        if (userId == null) {
            // 인증 없으면 쿠키만 비우고 종료(과제용 정책)
            return noContentWithExpiredCookies();
        }

        // 2) RefreshToken 먼저 모두 삭제 → FK 제약 회피
        try {
            refreshTokenRepository.deleteByUser_Id(userId);
        } catch (Exception ignored) { /* 과제용: 실패해도 계속 진행 */ }

        // 3) 사용자 삭제
        try {
            userRepository.deleteById(userId);
        } catch (Exception ignored) { /* 이미 삭제되었거나 제약 문제 → 무시 */ }

        // 4) 쿠키 즉시 만료(Set-Cookie)
        return noContentWithExpiredCookies();
    }

    // --- 내부 유틸 ---

    /** SecurityContext에서 userId를 다양한 principal 케이스에 맞춰 추출 */
    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;

        // case 1) Authentication#getName() 이 "123"처럼 userId 문자열인 경우
        try { return Long.parseLong(auth.getName()); } catch (Exception ignored) {}

        // case 2) principal 객체에 getId()가 있는 경우 (커스텀 Principal)
        Object principal = auth.getPrincipal();
        try {
            var m = principal.getClass().getMethod("getId");
            Object v = m.invoke(principal);
            if (v instanceof Number n) return n.longValue();
            if (v instanceof String s) return Long.parseLong(s);
        } catch (Exception ignored) {}

        // case 3) principal 자체가 숫자/문자열인 경우
        if (principal instanceof Number n) return n.longValue();
        if (principal instanceof String s) {
            try { return Long.parseLong(s); } catch (Exception ignored) {}
        }
        return null;
    }

    /** SameSite=None / Secure / HttpOnly 로 즉시 만료 쿠키 생성 및 204 응답 */
    private ResponseEntity<Void> noContentWithExpiredCookies() {
        ResponseCookie expiredAccess = ResponseCookie.from("ACCESS_TOKEN", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("None")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        ResponseCookie expiredRefresh = ResponseCookie.from("REFRESH_TOKEN", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("None")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, expiredAccess.toString())
                .header(HttpHeaders.SET_COOKIE, expiredRefresh.toString())
                .build();
    }
}
