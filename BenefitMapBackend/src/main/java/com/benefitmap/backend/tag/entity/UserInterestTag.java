package com.benefitmap.backend.tag.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_interest_tag")
public class UserInterestTag {
    @EmbeddedId
    private UserInterestTagId id;
}
