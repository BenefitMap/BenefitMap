package com.benefitmap.backend.user.dto;

import java.util.List;

/**
 * 마이페이지 수정 요청 DTO
 * - 이름 / 이메일 / 이미지 URL 은 안 받는다 (수정 불가)
 * - gender / age / regionDo / regionSi / 태그만 받는다
 */
public record UpdateMyPageRequest(
        String gender,                // "MALE" / "FEMALE"
        Integer age,                  // 12 같은 숫자
        String regionDo,              // "서울특별시"
        String regionSi,              // "종로구"
        List<Short> lifecycleTagIds,  // 생애주기 태그 id들
        List<Short> householdTagIds,  // 가구상황 태그 id들
        List<Short> interestTagIds    // 관심주제 태그 id들
) {}
