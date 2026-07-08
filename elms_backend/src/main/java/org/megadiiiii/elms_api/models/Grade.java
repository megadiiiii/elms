package org.megadiiiii.elms_api.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "grades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Grade extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity clazz;

    private Double listening = 0.0;
    private Double speaking = 0.0;
    private Double reading = 0.0;
    private Double writing = 0.0;
    private Double homework = 0.0;
    private Double participation = 0.0;
    private Double attendance = 0.0;
    private Double finalGrade;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "is_contacted", columnDefinition = "boolean default false")
    private boolean isContacted = false;

    @Column(name = "grade_type", length = 20, columnDefinition = "varchar(20) default 'REGULAR'")
    private String gradeType = "REGULAR"; // "REGULAR" hoặc "FINAL"
}