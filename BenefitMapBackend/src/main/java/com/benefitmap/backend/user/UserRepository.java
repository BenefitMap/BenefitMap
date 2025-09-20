package com.benefitmap.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 사용자 리포지토리
 * - Spring Data JPA 파생 쿼리 메서드 사용
 * - (provider, providerId) 또는 email 로 사용자 조회
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /** 소셜(OAuth2) 제공자와 제공자 고유ID로 조회 (계정 연결/로그인용) */
    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    /** 이메일로 조회 (중복 검사/로그인용) */
    Optional<User> findByEmail(String email);
}
