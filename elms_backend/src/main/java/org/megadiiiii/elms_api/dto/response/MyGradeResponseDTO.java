package org.megadiiiii.elms_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyGradeResponseDTO {
    private Long gradeId;
    private Long classId;
    private String className;
    private String courseName;
    private String teacherName;
    private String gradeType; // "REGULAR" or "FINAL"
    private Double listening;
    private Double speaking;
    private Double reading;
    private Double writing;
    private Double finalGrade;
    private String feedback;
}
