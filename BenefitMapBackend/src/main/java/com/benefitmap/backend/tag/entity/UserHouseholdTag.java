package com.benefitmap.backend.tag.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_household_tag")
public class UserHouseholdTag {
    @EmbeddedId
    private UserHouseholdTagId id;
}
