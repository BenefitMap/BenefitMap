package com.benefitmap.backend.config;

import lombok.RequiredArgsConstructor;
import com.benefitmap.backend.auth.oauth.CustomOAuth2UserService;
import com.benefitmap.backend.auth.jwt.JwtAuthenticationFilter;
import com.benefitmap.backend.auth.oauth.OAuth2SuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Security 기본 설정
 * - 세션 미사용(JWT) / OAuth2 로그인 성공 시 토큰 발급
 * - JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 배치
 * - 온보딩 사용자(ROLE_ONBOARDING) 접근 허용 범위를 명시
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final OAuth2SuccessHandler successHandler;
    private final CustomOAuth2UserService oAuth2UserService;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(b -> b.disable())
                .formLogin(f -> f.disable())

                .authorizeHttpRequests(auth -> auth
                        // 공개 엔드포인트
                        .requestMatchers("/", "/hello", "/error").permitAll()

                        // Swagger/OpenAPI
                        .requestMatchers(
                                "/swagger-ui.html", "/swagger-ui/**",
                                "/v3/api-docs/**", "/swagger-resources/**", "/webjars/**"
                        ).permitAll()

                        // 인증 필요/불필요 엔드포인트
                        .requestMatchers("/auth/logout").authenticated()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/**").permitAll()
                        .requestMatchers("/login/success", "/oauth2/authorization/**", "/login/oauth2/**").permitAll()

                        // ----- 온보딩 관련 권한 허용 -----
                        .requestMatchers(HttpMethod.GET, "/api/tags/**")
                        .hasAnyRole("ONBOARDING","USER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/onboarding")
                        .hasAnyRole("ONBOARDING","USER","ADMIN")

                        // 역할별 보호 구역
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/user/**").hasAnyRole("USER","ADMIN")

                        // 이외 경로는 인증 필요
                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(ui -> ui.userService(oAuth2UserService))
                        .successHandler(successHandler)
                );

        // JWT는 Username/Password 인증필터보다 먼저 실행
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /** CORS: allowed-origins(콤마 구분) 허용 + 자격증명(쿠키) 허용 + Authorization 헤더 노출 */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        for (String o : allowedOrigins.split(",")) c.addAllowedOrigin(o.trim());
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setExposedHeaders(List.of("Authorization","Set-Cookie")); // 프론트에서 토큰/쿠키 확인
        c.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**", c);
        return s;
    }
}
