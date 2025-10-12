package com.benefitmap.backend.config.security;

import lombok.RequiredArgsConstructor;
import com.benefitmap.backend.auth.oauth.CustomOAuth2UserService;
import com.benefitmap.backend.auth.jwt.JwtAuthenticationFilter;
import com.benefitmap.backend.auth.oauth.OAuth2SuccessHandler;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

/**
 * Spring Security 설정
 * - 세션 없이(JWT) 동작
 * - 엔드포인트 권한 정책 정의
 * - OAuth2 로그인 및 커스텀 성공 핸들러 연동
 * - CORS 허용 오리진을 외부 프로퍼티에서 주입
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableConfigurationProperties(AppCorsProperties.class)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final OAuth2SuccessHandler successHandler;
    private final CustomOAuth2UserService oAuth2UserService;
    private final AppCorsProperties corsProps;

    /**
     * 필터 체인 구성
     * - CSRF/폼로그인/HTTP Basic 비활성화
     * - CORS 허용
     * - 요청별 권한 매핑
     * - OAuth2 로그인 설정
     * - JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 배치
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1) 기본 보안 정책
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(b -> b.disable())
                .formLogin(f -> f.disable())

                // 2) 엔드포인트 권한 정책
                .authorizeHttpRequests(auth -> auth
                        // 공개 엔드포인트
                        .requestMatchers("/", "/hello", "/error").permitAll()

                        // Swagger/OpenAPI 문서
                        .requestMatchers(
                                "/swagger-ui.html", "/swagger-ui/**",
                                "/v3/api-docs/**", "/swagger-resources/**", "/webjars/**"
                        ).permitAll()

                        // 카탈로그(테스트 공개)
                        .requestMatchers(HttpMethod.GET, "/api/catalog/_debug/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/catalog/search").permitAll()

                        // 로그인/OAuth 콜백
                        .requestMatchers("/login/success", "/oauth2/authorization/**", "/login/oauth2/**").permitAll()

                        // 인증 관련
                        .requestMatchers("/auth/refresh").permitAll()
                        .requestMatchers("/auth/logout").authenticated()
                        .requestMatchers("/auth/**").permitAll()

                        // 온보딩(PENDING 허용)
                        .requestMatchers(HttpMethod.GET, "/api/tags/**")
                        .hasAnyRole("ONBOARDING","USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/onboarding")
                        .hasAnyRole("ONBOARDING","USER","ADMIN")

                        // 보호 구역
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/user/**").hasAnyRole("USER","ADMIN")

                        // 그 외는 인증 필요
                        .anyRequest().authenticated()
                )

                // 3) OAuth2 로그인
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(ui -> ui.userService(oAuth2UserService))
                        .successHandler(successHandler)
                );

        // 4) JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * CORS 설정
     * - app.cors.allowed-origins 값(쉼표 구분)을 읽어 적용
     * - 모든 헤더/메서드 허용
     * - 인증정보(쿠키/Authorization) 허용
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();

        // 1) 오리진 허용 목록 구성
        List<String> origins = corsProps.getAllowedOriginList();
        if (origins.isEmpty()) {
            // 값이 비어 있으면 로컬 개발 편의 패턴 허용(필요시 제거/조정)
            c.setAllowedOriginPatterns(List.of("http://localhost:*"));
        } else {
            origins.forEach(c::addAllowedOrigin);
        }

        // 2) 메서드/헤더/노출 헤더/크리덴셜
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setExposedHeaders(List.of("Authorization","Set-Cookie"));
        c.setAllowCredentials(true);

        // 3) URL 패턴에 매핑
        UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**", c);
        return s;
    }
}
