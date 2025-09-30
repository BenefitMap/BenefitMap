package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.UserInterestTag;
import com.benefitmap.backend.tag.entity.UserInterestTagId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserInterestTagRepository extends JpaRepository<UserInterestTag, UserInterestTagId> {
    void deleteByIdUserId(Long userId);
}
