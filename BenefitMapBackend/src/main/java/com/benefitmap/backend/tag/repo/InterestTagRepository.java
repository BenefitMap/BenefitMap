package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.InterestTag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterestTagRepository extends JpaRepository<InterestTag, Short> {
    List<InterestTag> findAllByActiveTrueOrderByDisplayOrderAsc();
    List<InterestTag> findByCodeIn(Iterable<String> codes);
}
