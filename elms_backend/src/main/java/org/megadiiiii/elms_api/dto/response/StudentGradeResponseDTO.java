package org.megadiiiii.elms_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentGradeResponseDTO {
    private Long studentId;
    private String studentCode;
    private String fullName;
    private String studentNickname;
    private String avatar;
    
    // Grade fields (might be null if not yet graded)
    private Long gradeId;
    private String gradeType; // "REGULAR" or "FINAL"
    private Double listening;
    private Double speaking;
    private Double reading;
    private Double writing;
    private Double finalGrade;
    private String feedback;
    private boolean isContacted;
}
