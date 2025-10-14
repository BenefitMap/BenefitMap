package com.benefitmap.backend.auth.jwt;

import com.benefitmap.backend.common.api.ApiResponse;
import com.benefitmap.backend.user.enums.Role;
import com.benefitmap.backend.user.entity.User;
import com.benefitmap.backend.user.repo.UserRepository;
import com.benefitmap.backend.user.enums.UserStatus;
import io.jsonwebtoken.*;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
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
 * JWT 인증 필터 (Stateless)
 * - 우선순위: Authorization: Bearer → ACCESS_TOKEN 쿠키
 * - 토큰 없으면 통과(공개 엔드포인트 유지), 유효하지 않으면 401/403 JSON
 * - 특정 경로는 PENDING도 허용(아래 화이트리스트 참조)
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    /** Swagger/OAuth 등 문서·핸드셰이크 경로는 필터 제외 */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String p = request.getRequestURI();
        return p.startsWith("/login")
                || p.startsWith("/oauth2")
                || p.startsWith("/swagger")
                || p.startsWith("/v3");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {

        // 1) 토큰 추출: Bearer → 쿠키(ACCESS_TOKEN)
        String token = extractToken(req);

        // 2) 토큰 부재: 그대로 통과
        if (token == null || token.isBlank()) {
            chain.doFilter(req, res);
            return;
        }

        try {
            // 3) 파싱/검증 + 사용자 조회
            Jws<Claims> jws = jwtProvider.parse(token);
            Long userId = parseUserId(jws);
            Optional<User> opt = userRepository.findById(userId);
            if (opt.isEmpty()) {
                writeJson(res, HttpServletResponse.SC_UNAUTHORIZED, ApiResponse.fail("User not found"));
                return;
            }
            User user = opt.get();

            // 4) PENDING 허용 경로: refresh/logout/onboarding/tags/user/me
            String uri = req.getRequestURI();
            boolean allowPending =
                    uri.equals("/auth/refresh") ||
                            uri.equals("/auth/logout")  ||
                            uri.startsWith("/api/onboarding") ||
                            uri.startsWith("/api/tags/") ||
                            uri.equals("/user/me");

            if (!allowPending && user.getStatus() != UserStatus.ACTIVE) {
                writeJson(res, HttpServletResponse.SC_FORBIDDEN, ApiResponse.fail("User not active"));
                return;
            }

            // 5) 인증 컨텍스트 세팅 (principal = User)
            var authority = new SimpleGrantedAuthority(
                    (user.getRole() != null ? user.getRole() : Role.ROLE_USER).name()
            );
            var auth = new UsernamePasswordAuthenticationToken(user, null, Collections.singletonList(authority));
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
            SecurityContextHolder.getContext().setAuthentication(auth);

            chain.doFilter(req, res);

        } catch (JwtException | IllegalArgumentException e) {
            writeJson(res, HttpServletResponse.SC_UNAUTHORIZED, ApiResponse.fail("Invalid or expired token"));
        }
    }

    private static String extractToken(HttpServletRequest req) {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) return h.substring(7);
        Cookie[] cs = req.getCookies();
        if (cs != null) {
            for (Cookie c : cs) if ("ACCESS_TOKEN".equals(c.getName())) return c.getValue();
        }
        return null;
    }

    private static Long parseUserId(Jws<Claims> jws) {
        String sub = jws.getPayload().getSubject();
        if (sub == null) throw new IllegalArgumentException("no subject");
        try { return Long.valueOf(sub); }
        catch (NumberFormatException e) { throw new IllegalArgumentException("bad subject"); }
    }

    /** ObjectMapper 없이 최소 JSON 응답 */
    private void writeJson(HttpServletResponse res, int status, ApiResponse<?> body) throws IOException {
        res.setStatus(status);
        res.setCharacterEncoding(StandardCharsets.UTF_8.name());
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String json = """
            {"success":%s,"message":%s,"data":null,"timestamp":"%s"}
        """.formatted(body.success(), toJsonString(body.message()), body.timestamp());
        res.getWriter().write(json);
    }

    private static String toJsonString(String s) {
        if (s == null) return "null";
        String esc = s.replace("\\","\\\\").replace("\"","\\\"");
        return "\"" + esc + "\"";
    }
}
