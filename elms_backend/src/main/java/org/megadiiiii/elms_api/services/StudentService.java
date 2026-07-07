package org.megadiiiii.elms_api.services;

import org.megadiiiii.elms_api.dto.request.StudentRequestDTO;
import org.megadiiiii.elms_api.dto.response.StudentDetailDTO;
import org.megadiiiii.elms_api.dto.response.StudentSummaryDTO;
import org.springframework.data.domain.Page;

public interface StudentService {
    Page<StudentSummaryDTO> getAllStudentSummaries(int page, int size, String keyword);

    StudentDetailDTO getStudentDetailById(Long id);

    String generateNextStudentCode();

    void createStudent(StudentRequestDTO requestDTO);

    void updateStudent(Long id, StudentRequestDTO requestDTO);

    StudentRequestDTO getStudentRequestById(Long id);

    void resetPassword(Long id);

    String toggleStudentStatus(Long id);

    java.util.List<StudentSummaryDTO> searchActiveStudentsForAutocomplete(String keyword);
}
