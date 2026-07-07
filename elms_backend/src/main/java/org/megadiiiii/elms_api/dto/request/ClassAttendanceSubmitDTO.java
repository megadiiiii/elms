package org.megadiiiii.elms_api.dto.request;

import lombok.Data;
import org.megadiiiii.elms_api.constant.AttendanceStatus;
import java.time.LocalDate;
import java.util.List;

@Data
public class ClassAttendanceSubmitDTO {
    private LocalDate date;
    private List<StudentAttendanceItem> items;

    @Data
    public static class StudentAttendanceItem {
        private Long studentId;
        private AttendanceStatus status;
        private String note;
    }
}
