package org.megadiiiii.elms_api.services.impl;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.constant.ClassStatus;
import org.megadiiiii.elms_api.constant.CourseStatus;
import org.megadiiiii.elms_api.constant.RoleType;
import org.megadiiiii.elms_api.dto.response.DashboardStatsResponse;
import org.megadiiiii.elms_api.repository.ClassRepository;
import org.megadiiiii.elms_api.repository.CourseRepository;
import org.megadiiiii.elms_api.repository.UserRepository;
import org.megadiiiii.elms_api.repository.AuditLogRepository;
import org.megadiiiii.elms_api.repository.GradeRepository;
import org.megadiiiii.elms_api.models.*;
import org.megadiiiii.elms_api.services.DashboardService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final ClassRepository clazzRepository;
    private final CourseRepository courseRepository;
    private final AuditLogRepository auditLogRepository;
    private final GradeRepository gradeRepository;

    @Override
    public DashboardStatsResponse getAdminStats() {
        long students = userRepository.countByRoleName(RoleType.STUDENT);
        long tas = userRepository.countByRoleName(RoleType.TA);
        long teachers = userRepository.countByRoleName(RoleType.TEACHER);
        long clazz = clazzRepository.countByStatus(ClassStatus.ONGOING);
        long course = courseRepository.countByStatus(CourseStatus.ACTIVE);;
        
        return DashboardStatsResponse.builder()
                .totalStudents(students)
                .totalTeachers(teachers)
                .totalTAs(tas)
                .activeClasses(clazz)
                .totalCourses(course)
                .build();
    }

    @Override
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findRecentLogs(PageRequest.of(0, 15));
    }

    @Override
    public Map<String, Object> getDashboardDataForUser(String usernameOrEmail) {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản người dùng!"));

        RoleType role = user.getRole().getName();
        Map<String, Object> responseData = new HashMap<>();

        if (RoleType.ADMIN.equals(role)) {
            responseData.put("stats", getAdminStats());
            responseData.put("recentLogs", getRecentLogs());
        } else if (RoleType.TEACHER.equals(role)) {
            // Lấy danh sách lớp do Giáo viên này phụ trách
            List<ClassEntity> teacherClasses = clazzRepository.findAll().stream()
                    .filter(c -> c.getTeacher() != null && c.getTeacher().getId().equals(user.getId()))
                    .collect(Collectors.toList());

            List<Map<String, Object>> classesList = teacherClasses.stream().map(c -> {
                Map<String, Object> classMap = new HashMap<>();
                classMap.put("id", c.getId());
                classMap.put("classCode", c.getClassCode());
                classMap.put("className", c.getClassName());
                classMap.put("courseName", c.getCourse() != null ? c.getCourse().getCourseName() : "Không có");
                classMap.put("studentCount", c.getStudents() != null ? c.getStudents().size() : 0);
                classMap.put("status", c.getStatus() != null ? c.getStatus().name() : "");
                return classMap;
            }).collect(Collectors.toList());

            responseData.put("classes", classesList);
        } else if (RoleType.TA.equals(role)) {
            // Lấy danh sách lớp do Trợ giảng này phụ trách
            List<ClassEntity> taClasses = clazzRepository.findAll().stream()
                    .filter(c -> c.getTa() != null && c.getTa().getId().equals(user.getId()))
                    .collect(Collectors.toList());

            // Tạo danh sách nhiệm vụ cần xử lý (rút gọn)
            List<Map<String, Object>> tasks = new ArrayList<>();

            if (!taClasses.isEmpty()) {
                // Chỉ lấy lớp đầu tiên hoặc tạo ít nhiệm vụ để giao diện gọn gàng
                ClassEntity c = taClasses.get(0);
                
                // Nhiệm vụ 1: Điểm danh
                Map<String, Object> task1 = new HashMap<>();
                task1.put("title", "Điểm danh lớp " + c.getClassName());
                task1.put("deadline", "Hôm nay");
                task1.put("path", "/classes/attendance/" + c.getId());
                tasks.add(task1);

                // Nhiệm vụ 2: Nhập điểm
                Map<String, Object> task2 = new HashMap<>();
                task2.put("title", "Nhập điểm lớp " + c.getClassName());
                task2.put("deadline", "Tuần này");
                task2.put("path", "/classes/grades/" + c.getId());
                tasks.add(task2);
            }

            // Thêm 1 nhiệm vụ họp định kỳ mặc định
            Map<String, Object> defTask = new HashMap<>();
            defTask.put("title", "Họp giao ban TA định kỳ");
            defTask.put("deadline", "Thứ Hai");
            defTask.put("path", "/schedule");
            tasks.add(defTask);

            responseData.put("tasks", tasks);
        } else if (RoleType.STUDENT.equals(role)) {
            Map<String, Object> studentData = new HashMap<>();

            // Tính điểm GPA (chỉ tính loại "FINAL", fallback sang toàn bộ nếu chưa có FINAL, và làm tròn đến mốc 0.5)
            List<Grade> studentGrades = gradeRepository.findByStudentProfileId(user.getId());
            double sum = 0.0;
            int count = 0;
            for (Grade g : studentGrades) {
                if ("FINAL".equals(g.getGradeType()) && g.getFinalGrade() != null) {
                    sum += g.getFinalGrade();
                    count++;
                }
            }
            if (count == 0) {
                for (Grade g : studentGrades) {
                    if (g.getFinalGrade() != null) {
                        sum += g.getFinalGrade();
                        count++;
                    }
                }
            }
            double rawGpa = count > 0 ? (sum / count) : 0.0;
            double gpa = Math.round(rawGpa * 2.0) / 2.0;
            studentData.put("gpa", gpa);

            // Danh sách lớp đang theo học
            List<ClassEntity> enrolledClasses = clazzRepository.findAll().stream()
                    .filter(c -> c.getStudents() != null && c.getStudents().stream()
                            .anyMatch(s -> s.getId().equals(user.getId())))
                    .collect(Collectors.toList());

            List<Map<String, Object>> enrolledList = enrolledClasses.stream().map(c -> {
                Map<String, Object> classMap = new HashMap<>();
                classMap.put("className", c.getClassName());
                classMap.put("courseName", c.getCourse() != null ? c.getCourse().getCourseName() : "Không có");
                classMap.put("status", c.getStatus() != null ? c.getStatus().name() : "");
                return classMap;
            }).collect(Collectors.toList());

            studentData.put("enrolledClasses", enrolledList);

            // Lấy 3 buổi học tiếp theo
            List<Map<String, Object>> nextSessions = new ArrayList<>();
            LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
            List<ClassSession> allSessions = enrolledClasses.stream()
                    .flatMap(c -> getOrGenerateSessions(c).stream())
                    .filter(s -> s.getSessionDate() != null && (s.getSessionDate().isAfter(today) || s.getSessionDate().isEqual(today)))
                    .sorted(Comparator.comparing(ClassSession::getSessionDate).thenComparing(ClassSession::getStartTime))
                    .limit(3)
                    .collect(Collectors.toList());

            DateTimeFormatter sessionDateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter sessionTimeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            for (ClassSession s : allSessions) {
                Map<String, Object> sessionMap = new HashMap<>();
                sessionMap.put("id", s.getId());
                sessionMap.put("className", s.getClassEntity().getClassName());
                sessionMap.put("sessionDate", s.getSessionDate().format(sessionDateFormatter));
                sessionMap.put("startTime", s.getStartTime() != null ? s.getStartTime().format(sessionTimeFormatter) : "08:00");
                sessionMap.put("endTime", s.getEndTime() != null ? s.getEndTime().format(sessionTimeFormatter) : "10:00");
                sessionMap.put("room", s.getClassEntity().getRoom() != null ? s.getClassEntity().getRoom() : "Online");
                nextSessions.add(sessionMap);
            }
            studentData.put("nextSessions", nextSessions);

            responseData.put("studentData", studentData);
        }

        return responseData;
    }

    private List<ClassSession> getOrGenerateSessions(ClassEntity classEntity) {
        List<ClassSession> dbSessions = classEntity.getSessions();
        if (dbSessions != null && !dbSessions.isEmpty()) {
            return dbSessions;
        }

        List<ClassSession> generated = new ArrayList<>();
        LocalDate startDate = classEntity.getStartDate();
        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
        if (startDate == null) {
            startDate = today;
        }
        Integer totalSessions = classEntity.getTotalSessions();
        if (totalSessions == null || totalSessions <= 0) {
            totalSessions = 10;
        }

        var schedules = classEntity.getSchedules();
        if (schedules == null || schedules.isEmpty()) {
            for (int i = 0; i < totalSessions; i++) {
                ClassSession session = new ClassSession();
                session.setClassEntity(classEntity);
                session.setSessionDate(startDate.plusDays(i));
                session.setStartTime(java.time.LocalTime.of(8, 0));
                session.setEndTime(java.time.LocalTime.of(10, 0));
                generated.add(session);
            }
            return generated;
        }

        LocalDate currentDate = startDate;
        int count = 0;
        int attempts = 0;
        while (count < totalSessions && attempts < 1000) {
            attempts++;
            java.time.DayOfWeek dow = currentDate.getDayOfWeek();
            int currentDayVal = dow == java.time.DayOfWeek.SUNDAY ? 8 : dow.getValue() + 1;

            final int targetDayVal = currentDayVal;
            var matchingSchedule = schedules.stream()
                    .filter(s -> s.getDayOfWeek() != null && s.getDayOfWeek() == targetDayVal)
                    .findFirst();

            if (matchingSchedule.isPresent()) {
                var s = matchingSchedule.get();
                ClassSession session = new ClassSession();
                session.setClassEntity(classEntity);
                session.setSessionDate(currentDate);
                session.setStartTime(s.getStartTime() != null ? s.getStartTime() : java.time.LocalTime.of(8, 0));
                session.setEndTime(s.getEndTime() != null ? s.getEndTime() : java.time.LocalTime.of(10, 0));
                generated.add(session);
                count++;
            }
            currentDate = currentDate.plusDays(1);
        }
        return generated;
    }
}
