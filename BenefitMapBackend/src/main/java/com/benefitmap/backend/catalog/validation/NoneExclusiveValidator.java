package com.benefitmap.backend.catalog.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.List;

/**
 * @NoneExclusive 검증 로직
 * - "NONE"이 포함될 경우 단독 선택만 허용
 * - 값이 비어 있거나 null이면 통과
 */
public class NoneExclusiveValidator implements ConstraintValidator<NoneExclusive, List<String>> {

    /**
     * 검증 수행
     * @param value 검증 대상 리스트
     * @param context 검증 컨텍스트
     * @return 유효하면 true, 규칙 위반 시 false
     */
    @Override
    public boolean isValid(List<String> value, ConstraintValidatorContext context) {
        // 1) 값이 없으면 통과
        if (value == null || value.isEmpty()) return true;

        // 2) NONE 포함 여부 확인
        boolean hasNone = value.contains("NONE");

        // 3) NONE이 있으면 단독만 허용
        return !hasNone || value.size() == 1;
    }
}
