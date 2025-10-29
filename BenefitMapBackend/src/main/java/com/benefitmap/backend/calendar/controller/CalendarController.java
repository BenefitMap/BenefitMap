package com.benefitmap.backend.calendar.controller;

import com.benefitmap.backend.calendar.entity.CalendarEntity;
import com.benefitmap.backend.calendar.service.CalendarService;
import com.benefitmap.backend.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    /* 현재 로그인한 유저 ID 추출 (UserController와 동일한 로직) */
    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;

        Object principal = auth.getPrincipal();
        if (principal instanceof User u) return u.getId();

        try {
            var m = principal.getClass().getMethod("getId");
            Object v = m.invoke(principal);
            if (v instanceof Number n) return n.longValue();
            if (v instanceof String s) return Long.parseLong(s);
        } catch (Exception ignored) {}

        return null;
    }

    /* 전체 일정 조회 */
    @GetMapping
    public List<CalendarItemResponse> getAllMyCalendarItems() {
        Long userId = currentUserId();
        List<CalendarEntity> items = calendarService.getAllForUser(userId);
        return items.stream().map(CalendarItemResponse::fromEntity).toList();
    }

    /* 특정 월 조회 */
    @GetMapping("/month")
    public List<CalendarItemResponse> getMyCalendarItemsForMonth(
            @RequestParam int year,
            @RequestParam int month
    ) {
        Long userId = currentUserId();
        List<CalendarEntity> items = calendarService.getForUserByMonth(userId, year, month);
        return items.stream().map(CalendarItemResponse::fromEntity).toList();
    }

    /* 일정 추가 */
    @PostMapping
    public ResponseEntity<?> addItem(@RequestBody AddCalendarItemRequest req) {
        Long userId = currentUserId();

        try {
            CalendarEntity saved = calendarService.addCalendarItem(
                    userId,
                    req.welfareId(),
                    req.title(),
                    req.description(),
                    req.department(),
                    LocalDate.parse(req.applicationPeriod().startDate()),
                    LocalDate.parse(req.applicationPeriod().endDate())
            );
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(CalendarItemResponse.fromEntity(saved));

        } catch (CalendarService.AlreadyExistsException e) {
            // 이미 있는 경우 → 409 CONFLICT + 간단 메세지
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        }
    }

    /* 일정 삭제 */
    @DeleteMapping("/{welfareId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long welfareId) {
        Long userId = currentUserId();
        calendarService.removeCalendarItem(userId, welfareId);
        return ResponseEntity.noContent().build();
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
            String startDate,
            String endDate
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
