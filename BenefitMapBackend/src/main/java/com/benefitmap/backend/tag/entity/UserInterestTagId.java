package com.benefitmap.backend.tag.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class UserInterestTagId implements Serializable {
    private Long userId;
    private Short tagId;
}
