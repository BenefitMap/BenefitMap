package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.UserLifecycleTag;
import com.benefitmap.backend.tag.entity.UserLifecycleTagId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserLifecycleTagRepository extends JpaRepository<UserLifecycleTag, UserLifecycleTagId> {
    void deleteByIdUserId(Long userId);
}
