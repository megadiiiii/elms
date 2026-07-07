package org.megadiiiii.elms_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleViewDTO {
    private String classCode;
    private String className;
    private int dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String teacherName;
    private String colorTag;
    private LocalDate sessionDate; 
    private String status;         
}