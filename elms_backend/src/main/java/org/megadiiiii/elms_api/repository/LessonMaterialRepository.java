package org.megadiiiii.elms_api.repository;

import org.megadiiiii.elms_api.models.LessonMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonMaterialRepository extends JpaRepository<LessonMaterial, Long> {
    List<LessonMaterial> findByCourseId(Long courseId);

    Optional<LessonMaterial> findByFileName(String fileName);

    List<LessonMaterial> findByTitleContainingIgnoreCase(String title);

    List<LessonMaterial> findByCourseIdAndTitleContainingIgnoreCase(Long courseId, String title);

}