package org.megadiiiii.elms_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.megadiiiii.elms_api.constant.ClassStatus;
import org.megadiiiii.elms_api.dto.request.ScheduleRequestDTO;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassDetailResponseDTO {
    private Long id;
    private String classCode;
    private String className;
    private String courseName;
    private Long courseId;
    private String teacherName;
    private Long teacherId;
    private String teacherAvatar;
    private String teacherCode;
    private String taName;
    private Long taId;
    private String taAvatar;
    private String taCode;
    private String scheduleSummary;
    private String room;
    private int currentStudents;
    private int maxStudents;
    private ClassStatus status;
    private LocalDate startDate;
    private Integer totalSessions;
    private List<ScheduleRequestDTO> schedules;
    private List<StudentSummaryDTO> students;
}
