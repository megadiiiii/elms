package org.megadiiiii.elms_api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.constant.ClassStatus;
import org.megadiiiii.elms_api.dto.request.ClassRequestDTO;
import org.megadiiiii.elms_api.dto.response.ClassSummaryResponseDTO;
import org.megadiiiii.elms_api.repository.ClassRepository;
import org.megadiiiii.elms_api.services.ClassService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TA')")
public class ClassController {

    private final ClassService classService;
    private final ClassRepository classRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> listClasses(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long courseId
    ) {
        Page<ClassSummaryResponseDTO> classesPage = classService.getClasses(page, size, keyword, status, courseId);

        Map<String, Object> response = Map.of(
                "classesPage", classesPage,
                "totalClasses", classRepository.count(),
                "upcomingClasses", classRepository.countByStatus(ClassStatus.UPCOMING),
                "ongoingClasses", classRepository.countByStatus(ClassStatus.ONGOING),
                "finishedClasses", classRepository.countByStatus(ClassStatus.FINISHED),
                "cancelledClasses", classRepository.countByStatus(ClassStatus.CANCELLED)
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassRequestDTO> getClassById(@PathVariable Long id) {
        ClassRequestDTO clazz = classService.getClassById(id);
        return ResponseEntity.ok(clazz);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> createClass(@Valid @RequestBody ClassRequestDTO classRequestDTO) {
        try {
            classService.createClass(classRequestDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Tạo lớp học mới thành công!"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateClass(
            @PathVariable Long id,
            @Valid @RequestBody ClassRequestDTO classRequestDTO
    ) {
        try {
            classService.updateClass(id, classRequestDTO);
            return ResponseEntity.ok(Map.of("message", "Cập nhật thông tin lớp học thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteClass(@PathVariable Long id) {
        try {
            classService.deleteClass(id);
            return ResponseEntity.ok(Map.of("message", "Xóa lớp học thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/room")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateClassRoom(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        try {
            String room = payload.get("room");
            classService.updateClassRoom(id, room);
            return ResponseEntity.ok(Map.of("message", "Cập nhật phòng học thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<org.megadiiiii.elms_api.dto.response.ClassDetailResponseDTO> getClassDetail(@PathVariable Long id) {
        return ResponseEntity.ok(classService.getClassDetail(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/students")
    public ResponseEntity<Map<String, String>> enrollStudent(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            if (payload.containsKey("studentIds")) {
                @SuppressWarnings("unchecked")
                List<Integer> idsRaw = (List<Integer>) payload.get("studentIds");
                if (idsRaw == null || idsRaw.isEmpty()) {
                    throw new IllegalArgumentException("Danh sách ID học viên không được để trống!");
                }
                List<Long> studentIds = idsRaw.stream().map(Number::longValue).toList();
                classService.enrollStudents(id, studentIds);
                return ResponseEntity.ok(Map.of("message", "Thêm các học viên vào lớp thành công!"));
            } else {
                Number studentIdRaw = (Number) payload.get("studentId");
                if (studentIdRaw == null) {
                    throw new IllegalArgumentException("ID học viên không được để trống!");
                }
                classService.enrollStudent(id, studentIdRaw.longValue());
                return ResponseEntity.ok(Map.of("message", "Thêm học viên vào lớp thành công!"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/students/{studentId}")
    public ResponseEntity<Map<String, String>> removeStudent(
            @PathVariable Long id,
            @PathVariable Long studentId
    ) {
        try {
            classService.removeStudent(id, studentId);
            return ResponseEntity.ok(Map.of("message", "Xóa học viên khỏi lớp thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/students/{studentId}/transfer")
    public ResponseEntity<Map<String, String>> transferStudent(
            @PathVariable Long id,
            @PathVariable Long studentId,
            @RequestParam Long targetClassId
    ) {
        try {
            classService.transferStudent(id, studentId, targetClassId);
            return ResponseEntity.ok(Map.of("message", "Chuyển lớp cho học viên thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}
