package com.benefitmap.backend.catalog.dto;

import java.util.List;

/**
 * 복지 항목 DTO
 * - 복지 카탈로그의 개별 항목 정보를 담는 데이터 전송 객체
 * - JSON 더미 데이터나 API 응답에서 사용됨
 */
public record WelfareItemDto(

        /** 고유 ID (JSON 또는 DB 식별용) */
        Long id,

        /** 복지명 */
        String welfareName,

        /** 복지 내용 요약 */
        String description,

        /** 담당 부처 또는 기관명 */
        String department,

        /** 지원 주기 (예: 수시, 연 1회 등) */
        String supportCycle,

        /** 지원 형태 (예: 현금지급, 바우처, 서비스 등) */
        String supplyType,

        /** 문의 전화번호 */
        String contact,

        /** 관련 사이트 주소 */
        String url,

        /** 생애주기 태그 목록 (예: YOUTH, SENIOR 등) */
        List<String> lifecycles,

        /** 가구상황 태그 목록 (예: LOW_INCOME, DISABLED 등) */
        List<String> households,

        /** 관심주제 태그 목록 (예: JOBS, HOUSING 등) */
        List<String> interests,

        /** 복지 신청 시작일 (예: 2025-10-05) */
        String startDate,

        /** 복지 신청 마감일 (예: 2025-10-20) */
        String endDate
) {}
