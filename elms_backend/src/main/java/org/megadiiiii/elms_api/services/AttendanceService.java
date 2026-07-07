package org.megadiiiii.elms_api.services;

import org.megadiiiii.elms_api.dto.request.ClassAttendanceSubmitDTO;
import org.megadiiiii.elms_api.dto.response.ClassStudentAttendanceDTO;
import org.megadiiiii.elms_api.dto.response.StudentAttendanceViewDTO;
import org.megadiiiii.elms_api.dto.response.ClassSessionDTO;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    List<ClassSessionDTO> getClassSessions(Long classId);
    List<ClassStudentAttendanceDTO> getClassAttendance(Long classId, LocalDate date);
    void submitClassAttendance(Long classId, ClassAttendanceSubmitDTO submitDTO);
    List<StudentAttendanceViewDTO> getStudentAttendanceHistory(String studentEmailOrUsername);
}
