package com.benefitmap.backend.catalog.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * households 필드 검증용 어노테이션
 * - "NONE"이 포함될 경우 단독 선택만 허용
 * - 다른 값과 함께 사용할 경우 검증 실패
 */
@Documented
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NoneExclusiveValidator.class)
public @interface NoneExclusive {

    /** 검증 실패 시 기본 메시지 */
    String message() default "households에 NONE은 단독으로만 선택할 수 있습니다.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
