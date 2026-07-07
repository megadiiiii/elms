package org.megadiiiii.elms_api.controller;

import org.megadiiiii.elms_api.dto.request.StudentRequestDTO;
import org.megadiiiii.elms_api.dto.response.StudentDetailDTO;
import org.megadiiiii.elms_api.dto.response.StudentSummaryDTO;
import org.megadiiiii.elms_api.services.StudentService;
import org.megadiiiii.elms_api.repository.StudentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

/**
 * REST Controller phục vụ các API quản lý học viên (Student) dành riêng cho ADMIN.
 */
@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TA')")
public class StudentController {

    private final StudentService studentService;
    private final StudentRepository studentRepository;

    /**
     * Lấy danh sách học viên dạng phân trang, lọc theo từ khóa.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> listStudents(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword
    ) {
        Page<StudentSummaryDTO> studentsPage = studentService.getAllStudentSummaries(page, size, keyword);
        
        Map<String, Object> response = Map.of(
            "studentsPage", studentsPage,
            "totalStudents", studentRepository.countAllStudents(),
            "activeStudents", studentRepository.countActiveStudents(),
            "inactiveStudents", studentRepository.countInactiveStudents()
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Tạo tài khoản học viên mới.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> createStudent(@Valid @RequestBody StudentRequestDTO studentRequestDTO) {
        studentService.createStudent(studentRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Tạo tài khoản học viên thành công cho " + studentRequestDTO.getStudentName()
        ));
    }

    /**
     * Lấy thông tin chi tiết (dưới dạng form yêu cầu chỉnh sửa) của một học viên.
     */
    @GetMapping("/{id}")
    public ResponseEntity<StudentRequestDTO> getStudentById(@PathVariable Long id) {
        StudentRequestDTO student = studentService.getStudentRequestById(id);
        return ResponseEntity.ok(student);
    }

    /**
     * Lấy hồ sơ chi tiết đầy đủ của một học viên.
     */
    @GetMapping("/{id}/detail")
    public ResponseEntity<StudentDetailDTO> getStudentDetailById(@PathVariable Long id) {
        StudentDetailDTO detail = studentService.getStudentDetailById(id);
        return ResponseEntity.ok(detail);
    }

    /**
     * Cập nhật thông tin chi tiết học viên.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequestDTO studentRequestDTO
    ) {
        studentService.updateStudent(id, studentRequestDTO);
        return ResponseEntity.ok(Map.of("message", "Cập nhật học viên thành công!"));
    }

    /**
     * Cấp lại mật khẩu ngẫu nhiên cho học viên và gửi email thông báo.
     */
    @PostMapping("/reset-password/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TA')")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable Long id) {
        studentService.resetPassword(id);
        return ResponseEntity.ok(Map.of("message", "Đã cấp lại mật khẩu mới và gửi về email!"));
    }

    /**
     * Đổi trạng thái Hoạt động / Khóa tài khoản học viên.
     */
    @PostMapping("/toggle-status/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> toggleStatus(@PathVariable Long id) {
        String actionName = studentService.toggleStudentStatus(id);
        return ResponseEntity.ok(Map.of("message", actionName + " tài khoản học viên thành công!"));
    }

    /**
     * Tìm kiếm học viên hoạt động cho autocomplete.
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<List<StudentSummaryDTO>> searchActiveStudentsForAutocomplete(
            @RequestParam(required = false) String keyword
    ) {
        List<StudentSummaryDTO> list = studentService.searchActiveStudentsForAutocomplete(keyword);
        return ResponseEntity.ok(list);
    }
}
