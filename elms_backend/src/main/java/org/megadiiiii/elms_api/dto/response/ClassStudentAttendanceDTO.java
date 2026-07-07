package org.megadiiiii.elms_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.megadiiiii.elms_api.constant.AttendanceStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassStudentAttendanceDTO {
    private Long studentId;
    private String studentCode;
    private String fullName;
    private AttendanceStatus status; 
    private String note;
}
