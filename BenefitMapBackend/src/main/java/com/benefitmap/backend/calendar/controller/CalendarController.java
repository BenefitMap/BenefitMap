package com.benefitmap.backend.calendar.controller;

import com.benefitmap.backend.calendar.entity.CalendarEntity;
import com.benefitmap.backend.calendar.service.CalendarService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    // TODO: 실제 로그인 유저 ID 추출 방식으로 바꿔야 함 (JWT 등)
    private Long getCurrentUserId() {
        return 1L;
    }

    /* 전체 일정 조회 */
    @GetMapping
    public List<CalendarItemResponse> getAllMyCalendarItems() {
        Long userId = getCurrentUserId();
        List<CalendarEntity> items = calendarService.getAllForUser(userId);
        return items.stream().map(CalendarItemResponse::fromEntity).toList();
    }

    /* 특정 월만 조회 (옵션) */
    @GetMapping("/month")
    public List<CalendarItemResponse> getMyCalendarItemsForMonth(
            @RequestParam int year,
            @RequestParam int month
    ) {
        Long userId = getCurrentUserId();
        List<CalendarEntity> items = calendarService.getForUserByMonth(userId, year, month);
        return items.stream().map(CalendarItemResponse::fromEntity).toList();
    }

    /* 일정 추가 */
    @PostMapping
    public CalendarItemResponse addItem(@RequestBody AddCalendarItemRequest req) {
        Long userId = getCurrentUserId();

        CalendarEntity saved = calendarService.addCalendarItem(
                userId,
                req.welfareId(),
                req.title(),
                req.description(),
                req.department(),
                LocalDate.parse(req.applicationPeriod().startDate()),
                LocalDate.parse(req.applicationPeriod().endDate())
        );

        return CalendarItemResponse.fromEntity(saved);
    }

    /* 일정 삭제 (welfareId 기준) */
    @DeleteMapping("/{welfareId}")
    public void deleteItem(@PathVariable Long welfareId) {
        Long userId = getCurrentUserId();
        calendarService.removeCalendarItem(userId, welfareId);
    }

    /* ==========================
       DTOs
       ========================== */

    public record AddCalendarItemRequest(
            Long welfareId,
            String title,
            String description,
            String department,
            ApplicationPeriod applicationPeriod
    ) {}

    public record ApplicationPeriod(
            String startDate, // "2025-05-01"
            String endDate    // "2025-05-31"
    ) {}

    public record CalendarItemResponse(
            Long id,
            Long welfareId,
            String title,
            String description,
            String department,
            ApplicationPeriod applicationPeriod
    ) {
        public static CalendarItemResponse fromEntity(CalendarEntity e) {
            return new CalendarItemResponse(
                    e.getId(),
                    e.getWelfareId(),
                    e.getTitle(),
                    e.getDescription(),
                    e.getDepartment(),
                    new ApplicationPeriod(
                            e.getStartDate().toString(),
                            e.getEndDate().toString()
                    )
            );
        }
    }
}
