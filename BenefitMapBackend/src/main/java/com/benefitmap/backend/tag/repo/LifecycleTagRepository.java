package com.benefitmap.backend.tag.repo;

import com.benefitmap.backend.tag.entity.LifecycleTag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LifecycleTagRepository extends JpaRepository<LifecycleTag, Short> {
    List<LifecycleTag> findAllByActiveTrueOrderByDisplayOrderAsc();
    List<LifecycleTag> findByCodeIn(Iterable<String> codes);
}
