package com.benefitmap.backend.onboarding.dto;

/**
 * 온보딩 태그 DTO
 * - 태그 정보를 클라이언트로 전달할 때 사용하는 데이터 구조
 * - 각 태그는 고유 ID, 코드, 한글명, 정렬 순서를 가진다.
 */
public record TagDto(

        /** 태그 식별자 (PK) */
        short id,

        /** 태그 코드 (영문/시스템 식별용 문자열) */
        String code,

        /** 태그 이름 (한국어 표시용) */
        String nameKo,

        /** 태그 정렬 순서 (UI 노출 시 순서를 제어하기 위해 사용) */
        int displayOrder
) {}
