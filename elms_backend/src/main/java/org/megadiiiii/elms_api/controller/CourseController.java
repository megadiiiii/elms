package org.megadiiiii.elms_api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.constant.CourseStatus;
import org.megadiiiii.elms_api.dto.response.CourseDTO;
import org.megadiiiii.elms_api.repository.CourseRepository;
import org.megadiiiii.elms_api.services.CourseService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.megadiiiii.elms_api.dto.response.ClassSummaryResponseDTO;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TA')")
public class CourseController {

    private final CourseService courseService;
    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> listCourses(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        Page<CourseDTO> coursesPage = courseService.getCourses(page, size, keyword, status);

        Map<String, Object> response = Map.of(
                "coursesPage", coursesPage,
                "totalCourses", courseRepository.count(),
                "activeCourses", courseRepository.countByStatus(CourseStatus.ACTIVE),
                "inactiveCourses", courseRepository.countByStatus(CourseStatus.INACTIVE)
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        CourseDTO course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    @GetMapping("/{id}/classes")
    public ResponseEntity<List<ClassSummaryResponseDTO>> getCourseClasses(@PathVariable Long id) {
        List<ClassSummaryResponseDTO> classes = courseService.getClassesByCourseId(id);
        return ResponseEntity.ok(classes);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> createCourse(@Valid @RequestBody CourseDTO courseDTO) {
        courseService.createCourse(courseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Tạo khóa học thành công!"
        ));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseDTO courseDTO
    ) {
        courseService.updateCourse(id, courseDTO);
        return ResponseEntity.ok(Map.of("message", "Cập nhật khóa học thành công!"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok(Map.of("message", "Xóa khóa học thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/toggle-status/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> toggleStatus(@PathVariable Long id) {
        courseService.toggleCourseStatus(id);
        return ResponseEntity.ok(Map.of("message", "Thay đổi trạng thái khóa học thành công!"));
    }
}
