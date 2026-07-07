package org.megadiiiii.elms_api.repository;

import org.megadiiiii.elms_api.models.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {

    Optional<Grade> findByStudentProfileIdAndClazzIdAndGradeType(Long studentId, Long classId, String gradeType);

    @Query("SELECT g FROM Grade g " +
            "JOIN FETCH g.studentProfile sp " +
            "JOIN FETCH sp.user " +
            "WHERE g.clazz.id = :classId AND g.gradeType = :gradeType")
    List<Grade> findByClazzIdAndGradeType(@Param("classId") Long classId, @Param("gradeType") String gradeType);

    List<Grade> findByStudentProfileId(Long studentProfileId);

    @Query(value = "SELECT " +
            "SUM(CASE WHEN final_grade < 5 THEN 1 ELSE 0 END) as low, " +
            "SUM(CASE WHEN final_grade >= 5 AND final_grade < 6.5 THEN 1 ELSE 0 END) as mid, " +
            "SUM(CASE WHEN final_grade >= 6.5 AND final_grade < 8 THEN 1 ELSE 0 END) as high, " +
            "SUM(CASE WHEN final_grade >= 8 THEN 1 ELSE 0 END) as expert " +
            "FROM grades", nativeQuery = true)
    Map<String, Long> getGradeDistribution();

    //Tính điểm trung bình 4 kỹ năng toàn trung tâm (Radar Chart)
    @Query("SELECT AVG(g.listening), AVG(g.speaking), AVG(g.reading), AVG(g.writing) FROM Grade g")
    List<Object[]> getAverageSkills();

    @Query("SELECT COUNT(DISTINCT g.studentProfile.id) FROM Grade g")
    Long countTotalStudents();

    @Query("SELECT AVG(g.finalGrade) FROM Grade g")
    Double getOverallAverage();

    @Query("SELECT g FROM Grade g " +
            "WHERE g.clazz.ta.user.username = :username")
    List<Grade> findByAssistantUsername(@Param("username") String username);
}