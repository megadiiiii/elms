package org.megadiiiii.elms_api.services.impl;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.dto.response.LessonMaterialResponseDTO;
import org.megadiiiii.elms_api.models.Course;
import org.megadiiiii.elms_api.models.LessonMaterial;
import org.megadiiiii.elms_api.repository.CourseRepository;
import org.megadiiiii.elms_api.repository.LessonMaterialRepository;
import org.megadiiiii.elms_api.services.LessonMaterialService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonMaterialServiceImpl implements LessonMaterialService {

    private final LessonMaterialRepository lessonMaterialRepository;
    private final CourseRepository courseRepository;

    private static final String UPLOAD_DIR = "./uploads/materials/";

    @Override
    @Transactional(readOnly = true)
    public List<LessonMaterialResponseDTO> getMaterialsByCourseId(Long courseId) {
        return lessonMaterialRepository.findByCourseId(courseId)
                .stream()
                .map(m -> LessonMaterialResponseDTO.builder()
                        .id(m.getId())
                        .title(m.getTitle())
                        .fileName(m.getFileName())
                        .contentType(m.getContentType())
                        .courseId(m.getCourse().getId())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LessonMaterialResponseDTO uploadMaterial(Long courseId, String title, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học!"));

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File tải lên không được để trống!");
        }

        try {
            // Ensure directory exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate clean unique filename
            String cleanOriginalName = Paths.get(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document").getFileName().toString();
            String uniqueFileName = UUID.randomUUID().toString() + "_" + cleanOriginalName;
            Path filePath = uploadPath.resolve(uniqueFileName);
            
            // Save file
            Files.copy(file.getInputStream(), filePath);

            // Save database entry
            LessonMaterial material = LessonMaterial.builder()
                    .title(title == null || title.isBlank() ? cleanOriginalName : title.trim())
                    .fileName(uniqueFileName)
                    .contentType(file.getContentType())
                    .course(course)
                    .build();

            LessonMaterial saved = lessonMaterialRepository.save(material);

            return LessonMaterialResponseDTO.builder()
                    .id(saved.getId())
                    .title(saved.getTitle())
                    .fileName(saved.getFileName())
                    .contentType(saved.getContentType())
                    .courseId(course.getId())
                    .build();

        } catch (IOException e) {
            throw new RuntimeException("Lỗi lưu file tài liệu: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteMaterial(Long id) {
        LessonMaterial material = lessonMaterialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài liệu!"));

        // Delete file from disk
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(material.getFileName());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Ignore failure to delete from disk and proceed with db deletion
        }

        lessonMaterialRepository.delete(material);
    }
}
