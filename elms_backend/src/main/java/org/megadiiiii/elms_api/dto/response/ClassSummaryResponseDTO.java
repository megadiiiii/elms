package org.megadiiiii.elms_api.dto.response;

import org.megadiiiii.elms_api.constant.ClassStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassSummaryResponseDTO {
    private Long id;
    private String classCode;
    private String className;
    private String courseName;
    private String teacherName;
    private String taName;
    private String scheduleSummary;
    private String room;
    private int currentStudents;
    private int maxStudents;
    private ClassStatus status;
    private Long mainTeacherId;
    private Long subTeacherId;
}