package org.megadiiiii.elms_api.models;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "staff_profiles")
public class StaffProfile {

    @Id
    private Long id;

    @Column(name = "staff_code", unique = true, length = 20)
    private String staffCode;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
}