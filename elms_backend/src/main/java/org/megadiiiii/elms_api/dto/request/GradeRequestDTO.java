package org.megadiiiii.elms_api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeRequestDTO {
    private Long studentId;
    private String gradeType; // "REGULAR" or "FINAL"
    private Double listening;
    private Double speaking;
    private Double reading;
    private Double writing;
    private Double finalGrade;
    private String feedback;
}
