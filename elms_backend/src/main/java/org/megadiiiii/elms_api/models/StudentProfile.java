package org.megadiiiii.elms_api.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "student_profiles")
public class StudentProfile extends BaseEntity {
    @Id
    private Long id;

    @Column(name = "student_code", unique = true, length = 20)
    private String studentCode;

    @Column(name = "student_nickname", length = 100)
    private String studentNickname;

    @Column(name = "parent_name")
    private String parentName;

    @Column(name = "parent_phone")
    private String parentPhone;

    @Column(name = "parent_email")
    private String parentEmail;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToMany(mappedBy = "students")
    private List<ClassEntity> classes;
}