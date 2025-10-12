package com.benefitmap.backend.user.repo;

import com.benefitmap.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 사용자 리포지토리
 * - provider + providerId 조회 (OAuth2 로그인/연결)
 * - email 조회 (중복 검사/로그인)
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /** 소셜 로그인 계정 조회 */
    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    /** 이메일로 조회 */
    Optional<User> findByEmail(String email);
}
