package org.megadiiiii.elms_api.repository;

import org.megadiiiii.elms_api.models.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByClassEntityIdAndStudentIdAndAttendanceDate(Long classId, Long studentId, LocalDate date);

    List<Attendance> findAllByClassEntityIdAndAttendanceDate(Long classId, LocalDate date);

    List<Attendance> findAllByClassEntityIdAndStudentIdOrderByAttendanceDateDesc(Long classId, Long studentId);

    List<Attendance> findAllByStudentIdOrderByAttendanceDateDesc(Long studentId);
}