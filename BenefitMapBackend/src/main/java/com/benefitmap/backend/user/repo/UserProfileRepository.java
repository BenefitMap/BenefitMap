package com.benefitmap.backend.user.repo;

import com.benefitmap.backend.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
}
