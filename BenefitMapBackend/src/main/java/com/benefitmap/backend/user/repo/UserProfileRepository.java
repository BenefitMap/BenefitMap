package com.benefitmap.backend.user.repo;

import com.benefitmap.backend.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 사용자 프로필 리포지토리
 * - PK = userId (users.id 공유)
 */
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
}
