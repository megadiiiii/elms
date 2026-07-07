package org.megadiiiii.elms_api.mappers;

import org.megadiiiii.elms_api.dto.response.ClassSummaryResponseDTO;
import org.megadiiiii.elms_api.dto.response.ClassDetailResponseDTO;
import org.megadiiiii.elms_api.dto.response.StudentSummaryDTO;
import org.megadiiiii.elms_api.models.ClassEntity;
import org.springframework.stereotype.Component;

import org.megadiiiii.elms_api.dto.request.ClassRequestDTO;
import org.megadiiiii.elms_api.dto.request.ScheduleRequestDTO;
import java.util.*;

@Component
public class ClassMapper {

    public ClassSummaryResponseDTO toSummaryDTO(ClassEntity clazz) {
        if (clazz == null) {
            return null;
        }
        return ClassSummaryResponseDTO.builder()
                .id(clazz.getId())
                .classCode(clazz.getClassCode())
                .className(clazz.getClassName())
                .courseName(clazz.getCourse() == null ? null : clazz.getCourse().getCourseName())
                .teacherName(clazz.getTeacher() == null || clazz.getTeacher().getUser() == null ? "Chưa phân công" : clazz.getTeacher().getUser().getFullName())
                .taName(clazz.getTa() == null || clazz.getTa().getUser() == null ? "Chưa phân công" : clazz.getTa().getUser().getFullName())
                .scheduleSummary(clazz.getScheduleSummary())
                .room(clazz.getRoom())
                .currentStudents(clazz.getStudents() == null ? 0 : clazz.getStudents().size())
                .maxStudents(clazz.getMaxStudents() == null ? 0 : clazz.getMaxStudents())
                .status(clazz.getStatus())
                .build();
    }

    public ClassDetailResponseDTO toDetailDTO(ClassEntity clazz) {
        if (clazz == null) {
            return null;
        }
        
        List<ScheduleRequestDTO> scheduleDTOs = new ArrayList<>();
        if (clazz.getSchedules() != null) {
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
            for (org.megadiiiii.elms_api.models.Schedule s : clazz.getSchedules()) {
                scheduleDTOs.add(ScheduleRequestDTO.builder()
                        .dayOfWeek(s.getDayOfWeek())
                        .startTime(s.getStartTime() == null ? null : s.getStartTime().format(formatter))
                        .endTime(s.getEndTime() == null ? null : s.getEndTime().format(formatter))
                        .build());
            }
        }

        List<StudentSummaryDTO> studentDTOs = new ArrayList<>();
        if (clazz.getStudents() != null) {
            for (org.megadiiiii.elms_api.models.StudentProfile s : clazz.getStudents()) {
                org.megadiiiii.elms_api.models.User user = s.getUser();
                studentDTOs.add(new StudentSummaryDTO(
                        s.getId(),
                        s.getStudentCode(),
                        user != null ? user.getFullName() : "Không rõ",
                        s.getStudentNickname(),
                        user != null ? user.getStatus() : null,
                        user != null ? user.getAvatar() : null,
                        user != null ? user.getEmail() : null,
                        user != null ? user.getDob() : null,
                        user != null ? user.getNationality() : null
                ));
            }
        }

        return ClassDetailResponseDTO.builder()
                .id(clazz.getId())
                .classCode(clazz.getClassCode())
                .className(clazz.getClassName())
                .courseName(clazz.getCourse() == null ? null : clazz.getCourse().getCourseName())
                .courseId(clazz.getCourse() == null ? null : clazz.getCourse().getId())
                .teacherName(clazz.getTeacher() == null || clazz.getTeacher().getUser() == null ? "Chưa phân công" : clazz.getTeacher().getUser().getFullName())
                .teacherId(clazz.getTeacher() == null ? null : clazz.getTeacher().getId())
                .teacherAvatar(clazz.getTeacher() == null || clazz.getTeacher().getUser() == null ? null : clazz.getTeacher().getUser().getAvatar())
                .teacherCode(clazz.getTeacher() == null ? null : clazz.getTeacher().getStaffCode())
                .taName(clazz.getTa() == null || clazz.getTa().getUser() == null ? "Chưa phân công" : clazz.getTa().getUser().getFullName())
                .taId(clazz.getTa() == null ? null : clazz.getTa().getId())
                .taAvatar(clazz.getTa() == null || clazz.getTa().getUser() == null ? null : clazz.getTa().getUser().getAvatar())
                .taCode(clazz.getTa() == null ? null : clazz.getTa().getStaffCode())
                .scheduleSummary(clazz.getScheduleSummary())
                .room(clazz.getRoom())
                .currentStudents(clazz.getStudents() == null ? 0 : clazz.getStudents().size())
                .maxStudents(clazz.getMaxStudents() == null ? 0 : clazz.getMaxStudents())
                .status(clazz.getStatus())
                .startDate(clazz.getStartDate())
                .totalSessions(clazz.getTotalSessions())
                .schedules(scheduleDTOs)
                .students(studentDTOs)
                .build();
    }

    public ClassRequestDTO toRequestDTO(ClassEntity clazz) {
        if (clazz == null) {
            return null;
        }
        List<ScheduleRequestDTO> scheduleDTOs = new ArrayList<>();
        if (clazz.getSchedules() != null) {
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
            for (org.megadiiiii.elms_api.models.Schedule s : clazz.getSchedules()) {
                scheduleDTOs.add(ScheduleRequestDTO.builder()
                        .dayOfWeek(s.getDayOfWeek())
                        .startTime(s.getStartTime() == null ? null : s.getStartTime().format(formatter))
                        .endTime(s.getEndTime() == null ? null : s.getEndTime().format(formatter))
                        .build());
            }
        }
        return ClassRequestDTO.builder()
                .classCode(clazz.getClassCode())
                .className(clazz.getClassName())
                .maxStudents(clazz.getMaxStudents())
                .startDate(clazz.getStartDate())
                .totalSessions(clazz.getTotalSessions())
                .courseId(clazz.getCourse() == null ? null : clazz.getCourse().getId())
                .teacherId(clazz.getTeacher() == null ? null : clazz.getTeacher().getId())
                .taId(clazz.getTa() == null ? null : clazz.getTa().getId())
                .room(clazz.getRoom())
                .status(clazz.getStatus() == null ? null : clazz.getStatus().name())
                .schedules(scheduleDTOs)
                .build();
    }

    public void updateEntityFromDTO(ClassRequestDTO dto, ClassEntity clazz) {
        if (dto == null || clazz == null) {
            return;
        }
        clazz.setClassCode(dto.getClassCode());
        clazz.setClassName(dto.getClassName());
        clazz.setMaxStudents(dto.getMaxStudents());
        clazz.setStartDate(dto.getStartDate());
        clazz.setTotalSessions(dto.getTotalSessions());
        clazz.setRoom(dto.getRoom());
        if (dto.getStatus() != null) {
            try {
                clazz.setStatus(org.megadiiiii.elms_api.constant.ClassStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep original
            }
        }
    }
}
