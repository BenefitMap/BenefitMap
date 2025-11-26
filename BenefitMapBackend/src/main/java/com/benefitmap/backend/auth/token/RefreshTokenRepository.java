package com.benefitmap.backend.auth.token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Refresh Token 리포지토리
 * - 원문 대신 해시로 조회/삭제
 * - 사용자 단위 일괄 삭제
 * - 활성 토큰 조회
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /** 해시로 단건 조회 */
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /** 해시로 단건 삭제(현재 기기 로그아웃) */
    void deleteByTokenHash(String tokenHash);

    /** 사용자 토큰 일괄 삭제(회원탈퇴/전체 로그아웃) */
    @Modifying
    @Transactional
    long deleteByUser_Id(Long userId);

    /** 활성 토큰 조회(미폐기 + 미만료) */
    @Query("""
       select rt from RefreshToken rt
       where rt.user.id = :userId
         and rt.revokedAt is null
         and rt.expiresAt > CURRENT_TIMESTAMP
       order by rt.expiresAt desc
    """)
    List<RefreshToken> findActiveByUserId(@Param("userId") Long userId);
}
