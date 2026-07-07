package org.megadiiiii.elms_api.dto.response;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CourseDTO {
    private Long id;
    
    @NotBlank(message = "Mã khóa học không được để trống")
    private String courseCode;

    @NotBlank(message = "Tên khóa học không được để trống")
    private String courseName;

    private String courseStatus;
    private Integer classCount;
}