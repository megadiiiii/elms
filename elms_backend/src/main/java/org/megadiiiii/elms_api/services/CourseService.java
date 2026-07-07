package org.megadiiiii.elms_api.services;

import org.megadiiiii.elms_api.dto.response.CourseDTO;
import org.megadiiiii.elms_api.dto.response.ClassSummaryResponseDTO;
import org.springframework.data.domain.Page;
import java.util.List;

public interface CourseService {
    Page<CourseDTO> getCourses(int page, int size, String keyword, String status);
    
    CourseDTO getCourseById(Long id);
    
    CourseDTO createCourse(CourseDTO dto);
    
    CourseDTO updateCourse(Long id, CourseDTO dto);
    
    void deleteCourse(Long id);
    
    void toggleCourseStatus(Long id);

    List<ClassSummaryResponseDTO> getClassesByCourseId(Long courseId);
}
