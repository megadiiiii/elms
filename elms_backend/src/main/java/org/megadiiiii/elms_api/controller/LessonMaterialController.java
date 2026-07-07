package org.megadiiiii.elms_api.controller;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.dto.response.LessonMaterialResponseDTO;
import org.megadiiiii.elms_api.services.LessonMaterialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LessonMaterialController {

    private final LessonMaterialService lessonMaterialService;

    @GetMapping("/{courseId}/materials")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TA', 'STUDENT')")
    public ResponseEntity<List<LessonMaterialResponseDTO>> getMaterialsByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(lessonMaterialService.getMaterialsByCourseId(courseId));
    }

    @PostMapping("/{courseId}/materials")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TA')")
    public ResponseEntity<LessonMaterialResponseDTO> uploadMaterial(
            @PathVariable Long courseId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam("file") MultipartFile file
    ) {
        LessonMaterialResponseDTO response = lessonMaterialService.uploadMaterial(courseId, title, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/materials/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'TA')")
    public ResponseEntity<Map<String, String>> deleteMaterial(@PathVariable Long id) {
        lessonMaterialService.deleteMaterial(id);
        return ResponseEntity.ok(Map.of("message", "Xóa tài liệu học tập thành công!"));
    }
}
