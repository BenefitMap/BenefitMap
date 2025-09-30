package com.benefitmap.backend.tag.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_lifecycle_tag")
public class UserLifecycleTag {
    @EmbeddedId
    private UserLifecycleTagId id;
}
