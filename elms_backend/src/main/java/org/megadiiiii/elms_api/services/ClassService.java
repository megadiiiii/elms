package org.megadiiiii.elms_api.services;

import org.megadiiiii.elms_api.dto.request.ClassRequestDTO;
import org.megadiiiii.elms_api.dto.response.ClassSummaryResponseDTO;
import org.springframework.data.domain.Page;

public interface ClassService {
    Page<ClassSummaryResponseDTO> getClasses(int page, int size, String keyword, String status, Long courseId);

    ClassRequestDTO getClassById(Long id);

    void createClass(ClassRequestDTO dto);

    void updateClass(Long id, ClassRequestDTO dto);

    void deleteClass(Long id);

    void updateClassRoom(Long id, String room);

    org.megadiiiii.elms_api.dto.response.ClassDetailResponseDTO getClassDetail(Long id);

    void enrollStudent(Long classId, Long studentId);
    void enrollStudents(Long classId, java.util.List<Long> studentIds);

    void removeStudent(Long classId, Long studentId);

    void transferStudent(Long sourceClassId, Long studentId, Long targetClassId);
}