package org.megadiiiii.elms_api.mappers;

import org.megadiiiii.elms_api.dto.response.CourseDTO;
import org.megadiiiii.elms_api.models.Course;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {
    
    public CourseDTO toDTO(Course course) {
        if (course == null) {
            return null;
        }
        return CourseDTO.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .courseStatus(course.getCourseStatus().name())
                .classCount(course.getClassList() == null ? 0 : course.getClassList().size())
                .build();
    }
}
