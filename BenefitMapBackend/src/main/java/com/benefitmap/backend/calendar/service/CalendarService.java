package com.benefitmap.backend.calendar.service;

import com.benefitmap.backend.calendar.entity.CalendarEntity;
import com.benefitmap.backend.calendar.repository.CalendarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@Transactional
public class CalendarService {

    private final CalendarRepository calendarRepository;

    public CalendarService(CalendarRepository calendarRepository) {
        this.calendarRepository = calendarRepository;
    }

    /**
     * 유저의 전체 캘린더 일정 리턴
     */
    @Transactional(readOnly = true)
    public List<CalendarEntity> getAllForUser(Long userId) {
        return calendarRepository.findByUserIdOrderByStartDateAsc(userId);
    }

    /**
     * 특정 연/월에 걸쳐있는 일정만 리턴
     * ex) 2025-05 달력 보고 싶으면 year=2025, month=5
     */
    @Transactional(readOnly = true)
    public List<CalendarEntity> getForUserByMonth(Long userId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate monthStart = ym.atDay(1);       // 2025-05-01
        LocalDate monthEnd = ym.atEndOfMonth();   // 2025-05-31

        return calendarRepository
                .findByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByStartDateAsc(
                        userId,
                        monthEnd,
                        monthStart
                );
    }

    /**
     * 일정 추가 (프론트에서 "캘린더에 추가" 눌렀을 때)
     * -> 같은 유저(userId)가 같은 복지(welfareId)를 이미 추가했다면 예외 던져서 컨트롤러에서 409로 내려보낸다.
     */
    public CalendarEntity addCalendarItem(
            Long userId,
            Long welfareId,
            String title,
            String description,
            String department,
            LocalDate startDate,
            LocalDate endDate
    ) {
        // 1) 이미 등록되어 있다면 예외 던짐 → 컨트롤러에서 409로 변환
        boolean alreadyExists = calendarRepository.existsByUserIdAndWelfareId(userId, welfareId);
        if (alreadyExists) {
            throw new AlreadyExistsException("이미 캘린더에 등록된 복지입니다.");
        }

        // 2) 없으면 새로 생성해서 저장
        CalendarEntity entity = new CalendarEntity();
        entity.setUserId(userId);
        entity.setWelfareId(welfareId);
        entity.setTitle(title);
        entity.setDescription(description);
        entity.setDepartment(department);
        entity.setStartDate(startDate);
        entity.setEndDate(endDate);
        return calendarRepository.save(entity);
    }

    /**
     * 삭제
     */
    public void removeCalendarItem(Long userId, Long welfareId) {
        calendarRepository.deleteByUserIdAndWelfareId(userId, welfareId);
    }

    /**
     * 중복 예외용 커스텀 런타임 예외
     */
    public static class AlreadyExistsException extends RuntimeException {
        public AlreadyExistsException(String message) {
            super(message);
        }
    }
}
