package org.megadiiiii.elms_api.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.megadiiiii.elms_api.constant.CourseStatus;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "courses") // Đổi từ "course" sang "courses" cho đồng bộ [cite: 2026-03-24]
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String courseCode;

    @Column(length = 100, nullable = false)
    private String courseName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CourseStatus courseStatus = CourseStatus.ACTIVE;

    @OneToMany(mappedBy = "course")
    private List<ClassEntity> classList;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LessonMaterial> materials;
}
