package com.benefitmap.backend.tag.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "lifecycle_tag")
public class LifecycleTag {
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
    private Boolean active = true;
}
