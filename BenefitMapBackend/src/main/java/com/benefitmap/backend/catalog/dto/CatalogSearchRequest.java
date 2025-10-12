package com.benefitmap.backend.catalog.dto;

import com.benefitmap.backend.catalog.validation.NoneExclusive;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * 카탈로그 검색 요청 DTO
 * - 복지 항목 검색 시 사용자가 입력한 조건을 전달하는 데이터 구조
 * - keyword, lifecycles, households, interests 필드로 구성
 * - households에는 @NoneExclusive 검증이 적용되어 NONE 단독 선택만 허용
 */
@Schema(description = "카탈로그 검색 요청")
public record CatalogSearchRequest(

        /** 키워드 (복지명 또는 내용 부분 일치 검색) */
        @Schema(description = "키워드(복지명/내용 부분일치)")
        String keyword,

        /** 생애주기 태그 목록 (예: YOUTH, SENIOR 등) */
        @Schema(description = "생애주기 태그 목록 예: YOUTH, SENIOR ...")
        List<String> lifecycles,

        /** 가구상황 태그 목록 (NONE은 단독 선택만 허용) */
        @NoneExclusive
        @Schema(description = "가구상황 태그 목록, NONE은 단독 선택만 허용")
        List<String> households,

        /** 관심주제 태그 목록 (예: HOUSING, JOBS 등) */
        @Schema(description = "관심주제 태그 목록 예: HOUSING, JOBS ...")
        List<String> interests
) {}
