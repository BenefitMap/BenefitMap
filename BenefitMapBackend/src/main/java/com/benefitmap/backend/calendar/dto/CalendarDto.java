package com.benefitmap.backend.calendar.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarDto {
    private Long id;             // serviceId
    private String title;
    private String description;
    private String department;
    private String contact;
    private List<String> tags;
    private ApplicationPeriod applicationPeriod;

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationPeriod {
        private String startDate;
        private String endDate;
        private Boolean isOngoing;
    }
}
