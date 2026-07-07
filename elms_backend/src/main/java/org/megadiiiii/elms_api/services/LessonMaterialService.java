package org.megadiiiii.elms_api.services;

import org.megadiiiii.elms_api.dto.response.LessonMaterialResponseDTO;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface LessonMaterialService {
    List<LessonMaterialResponseDTO> getMaterialsByCourseId(Long courseId);
    LessonMaterialResponseDTO uploadMaterial(Long courseId, String title, MultipartFile file);
    void deleteMaterial(Long id);
}
