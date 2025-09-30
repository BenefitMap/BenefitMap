package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.UserHouseholdTag;
import com.benefitmap.backend.tag.entity.UserHouseholdTagId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserHouseholdTagRepository extends JpaRepository<UserHouseholdTag, UserHouseholdTagId> {
    void deleteByIdUserId(Long userId);
}
