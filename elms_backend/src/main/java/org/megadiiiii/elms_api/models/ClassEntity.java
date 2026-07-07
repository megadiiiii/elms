package org.megadiiiii.elms_api.models;

import org.megadiiiii.elms_api.constant.ClassStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "classes")
public class ClassEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_code", nullable = false, unique = true)
    private String classCode;

    @Column(name = "class_name", nullable = false)
    private String className;

    private Integer maxStudents;
    private LocalDate startDate;
    private Integer totalSessions;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private StaffProfile teacher;

    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Schedule> schedules;

    @ManyToMany
    @JoinTable(
            name = "class_students",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private List<StudentProfile> students;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClassSession> sessions;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ClassStatus status = ClassStatus.UPCOMING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ta_id")
    private StaffProfile ta;

    private String room;

    public String getScheduleSummary() {
        if (this.schedules == null || this.schedules.isEmpty()) {
            return "Chưa có lịch";
        }
        StringBuilder sb = new StringBuilder();
        for (Schedule s : this.schedules) {
            String dayLabel = s.getDayOfWeek() == 8 ? "CN" : "T" + s.getDayOfWeek();
            sb.append(dayLabel).append(" ");
        }
        return sb.toString().trim();
    }
}