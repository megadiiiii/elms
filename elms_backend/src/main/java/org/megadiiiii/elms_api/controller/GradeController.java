package org.megadiiiii.elms_api.controller;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.dto.request.GradeRequestDTO;
import org.megadiiiii.elms_api.dto.response.StudentGradeResponseDTO;
import org.megadiiiii.elms_api.services.GradeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes/{classId}/grades")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TA')")
public class GradeController {

    private final GradeService gradeService;

    @GetMapping
    public ResponseEntity<List<StudentGradeResponseDTO>> getClassGrades(
            @PathVariable Long classId,
            @RequestParam(defaultValue = "REGULAR") String type
    ) {
        List<StudentGradeResponseDTO> grades = gradeService.getClassGrades(classId, type);
        return ResponseEntity.ok(grades);
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, String>> saveClassGrades(
            @PathVariable Long classId,
            @RequestParam(defaultValue = "REGULAR") String type,
            @RequestBody List<GradeRequestDTO> requests
    ) {
        try {
            gradeService.saveClassGrades(classId, type, requests);
            return ResponseEntity.ok(Map.of("message", "Lưu điểm thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{studentId}/send-report")
    public ResponseEntity<Map<String, String>> sendGradeReport(
            @PathVariable Long classId,
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "REGULAR") String type
    ) {
        try {
            gradeService.sendGradeReport(classId, studentId, type);
            return ResponseEntity.ok(Map.of("message", "Gửi email báo cáo điểm học tập thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
