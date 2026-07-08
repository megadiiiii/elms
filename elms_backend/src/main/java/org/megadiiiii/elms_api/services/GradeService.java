package org.megadiiiii.elms_api.services;

import org.megadiiiii.elms_api.dto.request.GradeRequestDTO;
import org.megadiiiii.elms_api.dto.response.StudentGradeResponseDTO;
import org.megadiiiii.elms_api.dto.response.MyGradeResponseDTO;

import java.util.List;

public interface GradeService {
    List<StudentGradeResponseDTO> getClassGrades(Long classId, String gradeType);
    
    void saveClassGrades(Long classId, String gradeType, List<GradeRequestDTO> requests);
    
    void sendGradeReport(Long classId, Long studentId, String gradeType);

    List<MyGradeResponseDTO> getMyGrades(String username);
}
