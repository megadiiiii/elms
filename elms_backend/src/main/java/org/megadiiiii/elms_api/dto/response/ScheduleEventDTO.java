package org.megadiiiii.elms_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleEventDTO {
    private String id;
    private String title;
    private String classCode;
    private String room;
    private List<Integer> daysOfWeek;
    private String startTime;
    private String endTime;
    private String startRecur;
    private String endRecur;
    private String teacherName;
    private String taName;
    private String courseName;
    private String color;
}
