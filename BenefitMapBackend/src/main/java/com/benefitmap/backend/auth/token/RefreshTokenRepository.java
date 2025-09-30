package com.benefitmap.backend.auth.token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 리프레시 토큰 JPA 리포지토리
 * - 토큰 원문 대신 해시(tokenHash)로 조회/삭제
 * - 사용자 전체 토큰 일괄 삭제 지원
 * - 활성 토큰(만료·폐기 안 된 것) 조회 메서드 추가
 * - 메서드명 기반 파생 쿼리 + @Query 혼용
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /** 해시로 단건 조회 */
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /** 현재 기기 로그아웃: 해시로 1건 삭제 */
    void deleteByTokenHash(String tokenHash);

    /** 회원탈퇴/전체 로그아웃: 해당 사용자 토큰 전부 삭제 */
    @Modifying
    @Transactional
    long deleteByUser_Id(Long userId);

    /** 특정 사용자 활성(refresh) 토큰 조회 */
    @Query("""
       select rt from RefreshToken rt
       where rt.user.id = :userId
         and rt.revokedAt is null
         and rt.expiresAt > CURRENT_TIMESTAMP
       order by rt.expiresAt desc
    """)
    List<RefreshToken> findActiveByUserId(@Param("userId") Long userId);
}
