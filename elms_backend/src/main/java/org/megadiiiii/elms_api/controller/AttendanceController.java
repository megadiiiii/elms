package org.megadiiiii.elms_api.controller;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.dto.request.ClassAttendanceSubmitDTO;
import org.megadiiiii.elms_api.dto.response.ClassStudentAttendanceDTO;
import org.megadiiiii.elms_api.dto.response.StudentAttendanceViewDTO;
import org.megadiiiii.elms_api.services.AttendanceService;
import org.megadiiiii.elms_api.dto.response.ClassSessionDTO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/classes/{classId}/sessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TA')")
    public ResponseEntity<List<ClassSessionDTO>> getClassSessions(@PathVariable Long classId) {
        return ResponseEntity.ok(attendanceService.getClassSessions(classId));
    }

    @GetMapping("/classes/{classId}/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TA')")
    public ResponseEntity<List<ClassStudentAttendanceDTO>> getClassAttendance(
            @PathVariable Long classId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        if (date == null) {
            date = LocalDate.now();
        }
        List<ClassStudentAttendanceDTO> attendance = attendanceService.getClassAttendance(classId, date);
        return ResponseEntity.ok(attendance);
    }

    @PostMapping("/classes/{classId}/attendance")
    @PreAuthorize("hasRole('TA')")
    public ResponseEntity<Map<String, String>> submitClassAttendance(
            @PathVariable Long classId,
            @RequestBody ClassAttendanceSubmitDTO submitDTO
    ) {
        attendanceService.submitClassAttendance(classId, submitDTO);
        return ResponseEntity.ok(Map.of("message", "Lưu điểm danh lớp học thành công!"));
    }

    @GetMapping("/students/attendance/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TA', 'STUDENT')")
    public ResponseEntity<List<StudentAttendanceViewDTO>> getMyAttendance() {
        String usernameOrEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        List<StudentAttendanceViewDTO> history = attendanceService.getStudentAttendanceHistory(usernameOrEmail);
        return ResponseEntity.ok(history);
    }
}
