package com.benefitmap.backend.calendar.repository;

import com.benefitmap.backend.calendar.entity.CalendarEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CalendarRepository extends JpaRepository<CalendarEntity, Long> {

    // 특정 유저 전체 일정 불러오기
    List<CalendarEntity> findByUserIdOrderByStartDateAsc(Long userId);

    // 특정 유저 + 특정 월(범위) 일정 불러오기
    List<CalendarEntity> findByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDateAsc(
            Long userId,
            LocalDate monthEnd,   // ex) 2025-05-31
            LocalDate monthStart  // ex) 2025-05-01
    );

    // 중복 추가 방지용으로 특정 복지(welfareId) 이미 있는지 확인
    Optional<CalendarEntity> findByUserIdAndWelfareId(Long userId, Long welfareId);

    // 삭제 시 쓸 수도 있음
    void deleteByUserIdAndWelfareId(Long userId, Long welfareId);
}
