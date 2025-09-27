package com.benefitmap.backend.auth.jwt;

import com.benefitmap.backend.web.ApiResponse;
import com.benefitmap.backend.user.enums.Role;
import com.benefitmap.backend.user.entity.User;
import com.benefitmap.backend.user.repo.UserRepository;
import com.benefitmap.backend.user.enums.UserStatus;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Optional;

/**
 * JWT 인증 필터
 * - 먼저 Authorization 헤더(Bearer)에서 토큰을 시도하고, 없으면 ACCESS_TOKEN 쿠키에서 확인
 * - subject(userId)로 사용자 정보를 불러와 DB의 최신 역할/상태를 반영
 * - 사용자 상태가 ACTIVE일 때만 인증 처리
 * - 토큰이 '존재하지만' 유효하지 않거나 만료된 경우 -> 401/403 JSON 응답
 * - 토큰이 '존재하지 않는' 경우 -> 그대로 통과(공개 엔드포인트는 계속 접근 가능)
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String p = request.getRequestURI();
        return p.startsWith("/login")
                || p.startsWith("/oauth2")
                || p.startsWith("/swagger")
                || p.startsWith("/v3")
                || p.equals("/auth/refresh");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        // 1) Extract token: header -> cookie
        String token = null;

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }

        if (token == null) {
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie c : cookies) {
                    if ("ACCESS_TOKEN".equals(c.getName())) {
                        token = c.getValue();
                        break;
                    }
                }
            }
        }

        // 2) No token -> pass through
        if (token == null || token.isBlank()) {
            chain.doFilter(request, response);
            return;
        }

        // 3) Parse/validate token and reflect latest user status
        try {
            Jws<Claims> jws = jwtProvider.parse(token);

            String sub = jws.getPayload().getSubject();
            if (sub == null) {
                writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, ApiResponse.fail("Invalid token: no subject"));
                return;
            }

            Long userId;
            try {
                userId = Long.valueOf(sub);
            } catch (NumberFormatException e) {
                writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, ApiResponse.fail("Invalid token: bad subject"));
                return;
            }

            Optional<User> opt = userRepository.findById(userId);
            if (opt.isEmpty()) {
                writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, ApiResponse.fail("User not found"));
                return;
            }

            User user = opt.get();
            if (user.getStatus() != UserStatus.ACTIVE) {
                writeJson(response, HttpServletResponse.SC_FORBIDDEN, ApiResponse.fail("User not active"));
                return;
            }

            // ★ principal을 userId가 아닌 User로 설정 → @AuthenticationPrincipal(expression="id") 정상 동작
            var authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()));
            var auth = new UsernamePasswordAuthenticationToken(user, null, authorities);
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);

            chain.doFilter(request, response);
        } catch (JwtException | IllegalArgumentException e) {
            writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, ApiResponse.fail("Invalid or expired token"));
        }
    }

    private void writeJson(HttpServletResponse response, int status, ApiResponse<?> body) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String json = """
                {"success":%s,"message":%s,"data":null,"timestamp":"%s"}
                """.formatted(
                body.success(),
                toJsonString(body.message()),
                body.timestamp().toString()
        );
        response.getWriter().write(json);
    }

    private String toJsonString(String s) {
        if (s == null) return "null";
        String esc = s.replace("\\", "\\\\").replace("\"", "\\\"");
        return "\"" + esc + "\"";
    }
}
