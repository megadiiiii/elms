package org.megadiiiii.elms_api.repository;

import org.megadiiiii.elms_api.constant.ClassStatus;
import org.megadiiiii.elms_api.models.ClassEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    
    @Query("SELECT c FROM ClassEntity c " +
           "WHERE (:keyword IS NULL OR LOWER(c.className) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.classCode) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:courseId IS NULL OR c.course.id = :courseId)")
    Page<ClassEntity> searchClasses(
            @Param("keyword") String keyword,
            @Param("status") ClassStatus status,
            @Param("courseId") Long courseId,
            Pageable pageable
    );

    long countByStatus(ClassStatus status);
}
