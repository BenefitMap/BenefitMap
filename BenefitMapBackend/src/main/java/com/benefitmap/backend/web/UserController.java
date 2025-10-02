package com.benefitmap.backend.web;

import com.benefitmap.backend.auth.token.RefreshTokenRepository;
import com.benefitmap.backend.user.repo.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;

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

    /** HTTPS 권장: true → Secure 쿠키 + SameSite=None */
    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @Operation(
            summary = "회원 탈퇴",
            description = "로그인한 사용자의 계정을 삭제하고 모든 리프레시 토큰을 제거합니다. ACCESS/REFRESH 쿠키를 즉시 만료합니다.",
            security = @SecurityRequirement(name = "cookieAuth"),
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "회원탈퇴 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = {
                                            @ExampleObject(
                                                    name = "DeleteSuccess",
                                                    value = """
                                                    {
                                                      "success": true,
                                                      "message": "deleted",
                                                      "data": null,
                                                      "timestamp": "2025-09-24T13:31:40.436095Z"
                                                    }
                                                    """
                                            ),
                                            @ExampleObject(
                                                    name = "NoAuthClearedCookies",
                                                    value = """
                                                    {
                                                      "success": true,
                                                      "message": "no auth, just cleared cookies",
                                                      "data": null,
                                                      "timestamp": "2025-09-24T13:31:40.436095Z"
                                                    }
                                                    """
                                            )
                                    }
                            )
                    )
            }
    )
    @DeleteMapping("/me")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteMe() {
        Long userId = currentUserId();
        if (userId == null) {
            return okWithExpiredCookies("no auth, just cleared cookies");
        }

        try { refreshTokenRepository.deleteByUser_Id(userId); } catch (Exception ignored) {}
        try { userRepository.deleteById(userId); } catch (Exception ignored) {}

        return okWithExpiredCookies("deleted");
    }

    // --- 내부 유틸 ---

    /**
     * SecurityContext에서 userId 추출
     * - principal(Number/String) 또는 getName()/getId() 리플렉션
     */
    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;

        Object principal = auth.getPrincipal();

        if (principal instanceof Number n) return n.longValue();       // Number
        if (principal instanceof String s) {                           // String
            try { return Long.parseLong(s); } catch (Exception ignored) {}
        }
        try { return Long.parseLong(auth.getName()); } catch (Exception ignored) {} // getName()

        // 마지막 시도: getId() 존재 시 사용
        try {
            var m = principal.getClass().getMethod("getId");
            Object v = m.invoke(principal);
            if (v instanceof Number n) return n.longValue();
            if (v instanceof String s) return Long.parseLong(s);
        } catch (Exception ignored) {}

        return null;
    }

    /** 만료 쿠키 적용 후 200 OK 반환 */
    private ResponseEntity<ApiResponse<Void>> okWithExpiredCookies(String message) {
        String sameSite = cookieSecure ? "None" : "Lax";

        ResponseCookie expiredAccess = ResponseCookie.from("ACCESS_TOKEN", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        ResponseCookie expiredRefresh = ResponseCookie.from("REFRESH_TOKEN", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredAccess.toString())
                .header(HttpHeaders.SET_COOKIE, expiredRefresh.toString())
                .body(ApiResponse.ok(message, null));
    }
}
