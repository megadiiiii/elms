package org.megadiiiii.elms_api.repository;

import org.megadiiiii.elms_api.constant.CourseStatus;
import org.megadiiiii.elms_api.models.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    //Pagination - Phân trang
    Page<Course> findByCourseNameContainingIgnoreCase(String courseName, Pageable pageable);

    Optional<Course> findByCourseCode(String courseCode);

    @Query("SELECT c FROM Course c WHERE " +
            "(:keyword IS NULL OR LOWER(c.courseName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (COALESCE(:statuses, NULL) IS NULL OR c.courseStatus IN :statuses)")
    Page<Course> findByFilters(@Param("keyword") String keyword,
                               @Param("statuses") List<CourseStatus> statuses,
                               Pageable pageable);

    // Count
    @Query("SELECT COUNT(c) FROM Course c WHERE c.courseStatus = :status")
    long countByStatus(@Param("status") CourseStatus status);
}
