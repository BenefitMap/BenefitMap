package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.HouseholdTag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HouseholdTagRepository extends JpaRepository<HouseholdTag, Short> {
    List<HouseholdTag> findAllByActiveTrueOrderByDisplayOrderAsc();
    List<HouseholdTag> findByCodeIn(Iterable<String> codes);
}
