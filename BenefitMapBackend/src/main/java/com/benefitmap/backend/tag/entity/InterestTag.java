package com.benefitmap.backend.tag.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 관심주제 태그 엔티티
 * - code, nameKo 고유값 유지
 * - displayOrder 기준 정렬
 * - active 플래그로 사용 여부 관리
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "interest_tag")
public class InterestTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short id;

    @Column(nullable = false, length = 40, unique = true)
    private String code;

    @Column(name = "name_ko", nullable = false, length = 40, unique = true)
    private String nameKo;

    @Column(name = "display_order", nullable = false)
    private Short displayOrder;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
