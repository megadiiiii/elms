package org.megadiiiii.elms_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAttendanceViewDTO {
    private LocalDate date;
    private String statusDisplayName; 
    private String statusKey;         
    private String note;
    private String className;
    private String courseName;
}