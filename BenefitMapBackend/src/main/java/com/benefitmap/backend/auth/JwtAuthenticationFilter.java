package com.benefitmap.backend.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.benefitmap.backend.user.Role;
import com.benefitmap.backend.user.User;
import com.benefitmap.backend.user.UserRepository;
import com.benefitmap.backend.user.UserStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

/**
 * JWT 인증 필터
 * - 우선 Authorization 헤더(Bearer)를 확인, 없으면 ACCESS_TOKEN 쿠키를 확인
 * - 토큰의 subject(userId)로 DB 조회 후 최신 권한/상태 반영
 * - 사용자 상태가 ACTIVE일 때만 SecurityContext에 인증 저장
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // 인증 제외 경로
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

        // 1) 토큰 추출: 헤더 → 쿠키 순으로 시도
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

        // 2) 토큰이 있으면 파싱/검증 후 DB 최신 권한/상태 반영
        if (token != null && !token.isBlank()) {
            try {
                // 서명/만료 검증 포함
                Jws<Claims> jws = jwtProvider.parse(token);

                // subject = userId (role 등은 DB에서 최신값 재조회)
                String sub = jws.getPayload().getSubject();
                if (sub != null) {
                    Long userId = Long.valueOf(sub);

                    Optional<User> opt = userRepository.findById(userId);
                    if (opt.isPresent()) {
                        User user = opt.get();

                        if (user.getStatus() == UserStatus.ACTIVE) {
                            Role role = user.getRole();
                            var authorities = Collections.singletonList(
                                    new SimpleGrantedAuthority(role.name())
                            );

                            // principal에는 userId만 저장
                            var auth = new UsernamePasswordAuthenticationToken(
                                    userId, null, authorities
                            );
                            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        }
                    }
                }
            } catch (JwtException | IllegalArgumentException ignore) {
                // 무효/만료/형식 오류 토큰은 무시하고 다음 필터 진행
                // 필요 시 여기서 401 응답으로 변경 가능
            }
        }

        chain.doFilter(request, response);
    }
}
