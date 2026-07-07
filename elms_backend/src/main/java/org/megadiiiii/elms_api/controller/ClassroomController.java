package org.megadiiiii.elms_api.controller;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.models.Classroom;
import org.megadiiiii.elms_api.services.ClassroomService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TA')")
public class ClassroomController {

    private final ClassroomService classroomService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> listClassrooms(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        Page<Classroom> classroomsPage = classroomService.getClassrooms(page, size, keyword, status);
        return ResponseEntity.ok(Map.of(
                "classroomsPage", classroomsPage,
                "totalClassrooms", classroomsPage.getTotalElements()
        ));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Classroom>> getAllClassrooms(@RequestParam(required = false) String status) {
        List<Classroom> classrooms = classroomService.getAllClassrooms(status);
        return ResponseEntity.ok(classrooms);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Classroom> getClassroomById(@PathVariable Long id) {
        Classroom classroom = classroomService.getClassroomById(id);
        return ResponseEntity.ok(classroom);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createClassroom(@RequestBody Classroom classroom) {
        try {
            Classroom created = classroomService.createClassroom(classroom);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Tạo phòng học thành công!",
                    "classroom", created
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateClassroom(
            @PathVariable Long id,
            @RequestBody Classroom classroom
    ) {
        try {
            Classroom updated = classroomService.updateClassroom(id, classroom);
            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật phòng học thành công!",
                    "classroom", updated
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteClassroom(@PathVariable Long id) {
        try {
            classroomService.deleteClassroom(id);
            return ResponseEntity.ok(Map.of("message", "Xóa phòng học thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}
