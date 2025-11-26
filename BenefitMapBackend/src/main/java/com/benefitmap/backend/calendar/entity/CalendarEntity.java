package com.benefitmap.backend.calendar.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_calendar")
public class CalendarEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 달력 row id (우리 쪽에서 쓰는 calendarServices용 id랑 매핑 가능)

    @Column(name = "user_id", nullable = false)
    private Long userId; // 로그인한 유저 ID

    @Column(name = "welfare_id", nullable = false)
    private Long welfareId; // 복지 서비스 id (프론트 service.id)

    @Column(nullable = false, length = 255)
    private String title; // service.title

    @Column(columnDefinition = "TEXT")
    private String description; // service.description

    @Column(length = 255)
    private String department; // service.department

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate; // applicationPeriod.startDate

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate; // applicationPeriod.endDate

    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false)
    private LocalDateTime updatedAt;

    // --- getters / setters ---

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getWelfareId() {
        return welfareId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getDepartment() {
        return department;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setWelfareId(Long welfareId) {
        this.welfareId = welfareId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}
