package org.megadiiiii.elms_api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassRequestDTO {
    
    @NotBlank(message = "Mã lớp học không được để trống!")
    private String classCode;

    @NotBlank(message = "Tên lớp học không được để trống!")
    private String className;

    @NotNull(message = "Sĩ số tối đa không được để trống!")
    @Min(value = 1, message = "Sĩ số tối đa phải lớn hơn 0!")
    private Integer maxStudents;

    private LocalDate startDate;
    
    @Min(value = 0, message = "Tổng số buổi học không được âm!")
    private Integer totalSessions;

    @NotNull(message = "Vui lòng chọn khóa học liên kết!")
    private Long courseId;

    private Long teacherId; // Giáo viên (StaffProfile id)
    
    private Long taId; // Trợ giảng (StaffProfile id)

    private String room;

    private String status; // UPCOMING, ONGOING, FINISHED, CANCELLED

    private List<ScheduleRequestDTO> schedules;
}
