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
import org.springframework.http.HttpStatus;
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
            summary = "내 정보 조회",
            description = "로그인한 사용자의 기본 정보를 반환합니다.",
            security = @SecurityRequirement(name = "cookieAuth"),
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "사용자 정보 조회 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class),
                                    examples = @ExampleObject(
                                            name = "UserInfoSuccess",
                                            value = """
                                            {
                                              "success": true,
                                              "message": "사용자 정보 조회 성공",
                                              "data": {
                                                "id": 1,
                                                "name": "홍길동",
                                                "email": "user@example.com",
                                                "imageUrl": "https://example.com/profile.jpg",
                                                "provider": "google"
                                              },
                                              "timestamp": "2025-01-27T00:00:00Z"
                                            }
                                            """
                                    )
                            )
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "401",
                            description = "인증되지 않은 사용자",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = ApiResponse.class)
                            )
                    )
            }
    )
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserInfo>> getMyInfo() {
        Long userId = currentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("인증되지 않은 사용자"));
        }

        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(ApiResponse.ok("사용자 정보 조회 성공", 
                        new UserInfo(user.getId(), user.getName(), user.getEmail(), user.getImageUrl(), user.getProvider()))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.fail("사용자를 찾을 수 없습니다")));
    }

    @Operation(
            summary = "회원 탈퇴",
            description = "로그인한 사용자의 계정을 삭제하고 모든 리프레시 토큰을 제거합니다. ACCESS/REFRESH 쿠키를 즉시 만료합니다.",
            security = @SecurityRequirement(name = "cookieAuth"),
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "OK",
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
     * SecurityContext에서 userId를 빠르게 추출한다.
     * 1) principal이 Number(기본 정책) → 바로 반환
     * 2) principal이 String → Long 파싱
     * 3) Authentication#getName() 시도
     * 4) (최후) principal.getId() 리플렉션
     */
    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;

        Object principal = auth.getPrincipal();

        // 1) principal이 숫자인 경우 (JwtAuthenticationFilter에서 기본 제공)
        if (principal instanceof Number n) return n.longValue();

        // 2) principal이 문자열인 경우
        if (principal instanceof String s) {
            try { return Long.parseLong(s); } catch (Exception ignored) {}
        }

        // 3) Authentication#getName() 시도
        try { return Long.parseLong(auth.getName()); } catch (Exception ignored) {}

        // 4) (최후) 커스텀 principal.getId() 리플렉션
        try {
            var m = principal.getClass().getMethod("getId");
            Object v = m.invoke(principal);
            if (v instanceof Number n) return n.longValue();
            if (v instanceof String s) return Long.parseLong(s);
        } catch (Exception ignored) {}

        return null;
    }

    /** SameSite: 로컬(HTTP)=Lax, 운영(HTTPS)=None 로 만료 쿠키 생성 후 200 OK(JSON) */
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

    // 사용자 정보 응답 DTO
    public record UserInfo(
            Long id,
            String name,
            String email,
            String imageUrl,
            String provider
    ) {}
}
