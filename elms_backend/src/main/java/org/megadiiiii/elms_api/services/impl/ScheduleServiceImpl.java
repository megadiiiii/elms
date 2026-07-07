package org.megadiiiii.elms_api.services.impl;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.dto.response.ScheduleEventDTO;
import org.megadiiiii.elms_api.models.*;
import org.megadiiiii.elms_api.repository.ClassRepository;
import org.megadiiiii.elms_api.repository.UserRepository;
import org.megadiiiii.elms_api.services.ScheduleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleServiceImpl implements ScheduleService {

    private final UserRepository userRepository;
    private final ClassRepository classRepository;

    @Override
    public List<ScheduleEventDTO> getCurrentUserSchedule(String usernameOrEmail) {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản người dùng!"));

        org.megadiiiii.elms_api.constant.RoleType roleType = user.getRole().getName();
        List<ClassEntity> classes;

        if (org.megadiiiii.elms_api.constant.RoleType.ADMIN.equals(roleType)) {
            classes = classRepository.findAll();
        } else if (org.megadiiiii.elms_api.constant.RoleType.TEACHER.equals(roleType) || 
                   org.megadiiiii.elms_api.constant.RoleType.TA.equals(roleType)) {
            classes = classRepository.findAll().stream()
                    .filter(c -> (c.getTeacher() != null && c.getTeacher().getId().equals(user.getId())) ||
                                 (c.getTa() != null && c.getTa().getId().equals(user.getId())))
                    .collect(Collectors.toList());
        } else if (org.megadiiiii.elms_api.constant.RoleType.STUDENT.equals(roleType)) {
            classes = classRepository.findAll().stream()
                    .filter(c -> c.getStudents() != null && c.getStudents().stream()
                            .anyMatch(s -> s.getId().equals(user.getId())))
                    .collect(Collectors.toList());
        } else {
            classes = Collections.emptyList();
        }

        List<ScheduleEventDTO> events = new ArrayList<>();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        for (ClassEntity c : classes) {
            if (c.getSchedules() == null || c.getSchedules().isEmpty()) {
                continue;
            }

            LocalDate startDate = c.getStartDate() != null ? c.getStartDate() : LocalDate.now();
            int totalSessions = c.getTotalSessions() != null ? c.getTotalSessions() : 30;
            LocalDate endDate = calculateEndDate(startDate, c.getSchedules(), totalSessions);

            String courseName = c.getCourse() != null ? c.getCourse().getCourseName() : "Không có";
            String eventColor = getEventColor(courseName);

            String teacherName = (c.getTeacher() != null && c.getTeacher().getUser() != null) ? c.getTeacher().getUser().getFullName() : "Chưa phân công";
            String taName = (c.getTa() != null && c.getTa().getUser() != null) ? c.getTa().getUser().getFullName() : "Chưa phân công";

            for (Schedule s : c.getSchedules()) {
                // Convert DB dayOfWeek (2=Mon, 3=Tue, ..., 8=Sun) to FullCalendar dayOfWeek (0=Sun, 1=Mon, ..., 6=Sat)
                int fcDay = s.getDayOfWeek() == 8 ? 0 : s.getDayOfWeek() - 1;

                events.add(ScheduleEventDTO.builder()
                        .id(c.getId() + "_" + s.getId())
                        .title(c.getClassName())
                        .classCode(c.getClassCode())
                        .room(c.getRoom())
                        .daysOfWeek(Collections.singletonList(fcDay))
                        .startTime(s.getStartTime() != null ? s.getStartTime().format(timeFormatter) : "08:00")
                        .endTime(s.getEndTime() != null ? s.getEndTime().format(timeFormatter) : "10:00")
                        .startRecur(startDate.format(dateFormatter))
                        .endRecur(endDate.format(dateFormatter))
                        .teacherName(teacherName)
                        .taName(taName)
                        .courseName(courseName)
                        .color(eventColor)
                        .build());
            }
        }

        return events;
    }

    private LocalDate calculateEndDate(LocalDate startDate, List<Schedule> schedules, int totalSessions) {
        if (schedules == null || schedules.isEmpty() || totalSessions <= 0) {
            return startDate.plusMonths(3);
        }

        List<Schedule> sortedSchedules = new ArrayList<>(schedules);
        sortedSchedules.sort(Comparator.comparingInt(Schedule::getDayOfWeek));

        LocalDate currentDate = startDate;
        int sessionsCount = 0;

        while (sessionsCount < totalSessions) {
            // DB dayOfWeek is: 2=Mon, ..., 8=Sun.
            // LocalDate dayOfWeek value is: 1=Mon, ..., 7=Sun.
            int currentDbDay = currentDate.getDayOfWeek().getValue() == 7 ? 8 : currentDate.getDayOfWeek().getValue() + 1;

            for (Schedule s : sortedSchedules) {
                if (s.getDayOfWeek().equals(currentDbDay)) {
                    sessionsCount++;
                    if (sessionsCount >= totalSessions) {
                        // FullCalendar endRecur is exclusive, so we must add 1 day to make the last session day inclusive!
                        return currentDate.plusDays(1);
                    }
                }
            }
            currentDate = currentDate.plusDays(1);

            // Safety limit
            if (currentDate.isAfter(startDate.plusYears(1))) {
                break;
            }
        }
        return currentDate;
    }

    private String getEventColor(String courseName) {
        if (courseName == null) return "#6366f1";
        int hash = Math.abs(courseName.hashCode());
        String[] colors = {
            "#4f46e5", // Indigo
            "#059669", // Emerald
            "#d97706", // Amber
            "#dc2626", // Red/Rose
            "#0891b2", // Cyan
            "#7c3aed", // Violet
            "#db2777"  // Pink
        };
        return colors[hash % colors.length];
    }
}
