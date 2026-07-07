package org.megadiiiii.elms_api.services.impl;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.dto.request.ClassAttendanceSubmitDTO;
import org.megadiiiii.elms_api.dto.response.ClassStudentAttendanceDTO;
import org.megadiiiii.elms_api.dto.response.StudentAttendanceViewDTO;
import org.megadiiiii.elms_api.models.Attendance;
import org.megadiiiii.elms_api.models.ClassEntity;
import org.megadiiiii.elms_api.models.StudentProfile;
import org.megadiiiii.elms_api.models.User;
import org.megadiiiii.elms_api.dto.response.ClassSessionDTO;
import org.megadiiiii.elms_api.models.ClassSession;
import org.megadiiiii.elms_api.repository.AttendanceRepository;
import org.megadiiiii.elms_api.repository.ClassRepository;
import org.megadiiiii.elms_api.repository.ClassSessionRepository;
import org.megadiiiii.elms_api.repository.UserRepository;
import org.megadiiiii.elms_api.services.AttendanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final ClassSessionRepository classSessionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ClassSessionDTO> getClassSessions(Long classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học!"));

        List<ClassSession> dbSessions = classSessionRepository.findAllByClassEntityIdOrderBySessionDateAsc(classId);
        if (dbSessions != null && !dbSessions.isEmpty()) {
            return dbSessions.stream()
                    .map(s -> ClassSessionDTO.builder()
                            .id(s.getId())
                            .sessionDate(s.getSessionDate())
                            .startTime(s.getStartTime())
                            .endTime(s.getEndTime())
                            .status(s.getStatus() != null ? s.getStatus().name() : "SCHEDULED")
                            .build())
                    .collect(Collectors.toList());
        }

        return generateDynamicSessions(classEntity);
    }

    private int getDayOfWeekValue(java.time.DayOfWeek dayOfWeek) {
        if (dayOfWeek == java.time.DayOfWeek.SUNDAY) {
            return 8;
        }
        return dayOfWeek.getValue() + 1;
    }

    private List<ClassSessionDTO> generateDynamicSessions(ClassEntity classEntity) {
        List<ClassSessionDTO> list = new ArrayList<>();
        LocalDate startDate = classEntity.getStartDate();
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        Integer totalSessions = classEntity.getTotalSessions();
        if (totalSessions == null || totalSessions <= 0) {
            totalSessions = 10;
        }

        var schedules = classEntity.getSchedules();
        if (schedules == null || schedules.isEmpty()) {
            for (int i = 0; i < totalSessions; i++) {
                list.add(ClassSessionDTO.builder()
                        .id(null)
                        .sessionDate(startDate.plusDays(i))
                        .startTime(java.time.LocalTime.of(8, 0))
                        .endTime(java.time.LocalTime.of(10, 0))
                        .status("SCHEDULED")
                        .build());
            }
            return list;
        }

        LocalDate currentDate = startDate;
        int count = 0;
        int attempts = 0;
        while (count < totalSessions && attempts < 1000) {
            attempts++;
            int currentDayVal = getDayOfWeekValue(currentDate.getDayOfWeek());
            final LocalDate dateToUse = currentDate;
            var matchingSchedule = schedules.stream()
                    .filter(s -> s.getDayOfWeek() != null && s.getDayOfWeek() == currentDayVal)
                    .findFirst();

            if (matchingSchedule.isPresent()) {
                var s = matchingSchedule.get();
                list.add(ClassSessionDTO.builder()
                        .id(null)
                        .sessionDate(dateToUse)
                        .startTime(s.getStartTime() != null ? s.getStartTime() : java.time.LocalTime.of(8, 0))
                        .endTime(s.getEndTime() != null ? s.getEndTime() : java.time.LocalTime.of(10, 0))
                        .status("SCHEDULED")
                        .build());
                count++;
            }
            currentDate = currentDate.plusDays(1);
        }
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassStudentAttendanceDTO> getClassAttendance(Long classId, LocalDate date) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học!"));

        List<StudentProfile> students = classEntity.getStudents();
        List<ClassStudentAttendanceDTO> result = new ArrayList<>();

        for (StudentProfile student : students) {
            Optional<Attendance> attendanceOpt = attendanceRepository
                    .findByClassEntityIdAndStudentIdAndAttendanceDate(classId, student.getId(), date);

            ClassStudentAttendanceDTO dto = new ClassStudentAttendanceDTO();
            dto.setStudentId(student.getId());
            dto.setStudentCode(student.getStudentCode());
            dto.setFullName(student.getUser().getFullName());
            
            if (attendanceOpt.isPresent()) {
                dto.setStatus(attendanceOpt.get().getStatus());
                dto.setNote(attendanceOpt.get().getNote());
            } else {
                dto.setStatus(null);
                dto.setNote("");
            }
            result.add(dto);
        }

        return result;
    }

    @Override
    public void submitClassAttendance(Long classId, ClassAttendanceSubmitDTO submitDTO) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học!"));

        LocalDate date = submitDTO.getDate();
        if (date == null) {
            date = LocalDate.now();
        }

        for (ClassAttendanceSubmitDTO.StudentAttendanceItem item : submitDTO.getItems()) {
            User user = userRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng!"));
            StudentProfile student = user.getStudentProfile();
            if (student == null) {
                throw new IllegalArgumentException("Người dùng không phải là học viên!");
            }

            Optional<Attendance> attendanceOpt = attendanceRepository
                    .findByClassEntityIdAndStudentIdAndAttendanceDate(classId, student.getId(), date);

            Attendance attendance;
            if (attendanceOpt.isPresent()) {
                attendance = attendanceOpt.get();
            } else {
                attendance = new Attendance();
                attendance.setClassEntity(classEntity);
                attendance.setStudent(student);
                attendance.setAttendanceDate(date);
            }

            attendance.setStatus(item.getStatus());
            attendance.setNote(item.getNote());
            attendanceRepository.save(attendance);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentAttendanceViewDTO> getStudentAttendanceHistory(String studentEmailOrUsername) {
        User user = userRepository.findByUsernameOrEmail(studentEmailOrUsername, studentEmailOrUsername)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản người dùng!"));

        List<Attendance> attendances = attendanceRepository.findAllByStudentIdOrderByAttendanceDateDesc(user.getId());
        List<StudentAttendanceViewDTO> result = new ArrayList<>();

        for (Attendance att : attendances) {
            StudentAttendanceViewDTO dto = StudentAttendanceViewDTO.builder()
                    .date(att.getAttendanceDate())
                    .statusKey(att.getStatus().name())
                    .statusDisplayName(att.getStatus().getDisplayName())
                    .note(att.getNote())
                    .className(att.getClassEntity().getClassName())
                    .courseName(att.getClassEntity().getCourse() != null ? att.getClassEntity().getCourse().getCourseName() : "")
                    .build();
            result.add(dto);
        }

        return result;
    }
}
