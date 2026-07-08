package org.megadiiiii.elms_api.services.impl;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.constant.ClassStatus;
import org.megadiiiii.elms_api.dto.request.ClassRequestDTO;
import org.megadiiiii.elms_api.dto.request.ScheduleRequestDTO;
import org.megadiiiii.elms_api.dto.response.ClassSummaryResponseDTO;
import org.megadiiiii.elms_api.dto.response.ClassDetailResponseDTO;
import org.megadiiiii.elms_api.mappers.ClassMapper;
import org.megadiiiii.elms_api.models.*;
import org.megadiiiii.elms_api.repository.ClassRepository;
import org.megadiiiii.elms_api.repository.CourseRepository;
import org.megadiiiii.elms_api.repository.StaffProfileRepository;
import org.megadiiiii.elms_api.repository.ClassroomRepository;
import org.megadiiiii.elms_api.repository.StudentRepository;
import org.megadiiiii.elms_api.services.AuditLogService;
import org.megadiiiii.elms_api.services.ClassService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClassServiceImpl implements ClassService {

    private final ClassRepository classRepository;
    private final CourseRepository courseRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final ClassMapper classMapper;
    private final ClassroomRepository classroomRepository;
    private final StudentRepository studentRepository;
    private final AuditLogService auditLogService;

    @Override
    public Page<ClassSummaryResponseDTO> getClasses(int page, int size, String keyword, String status, Long courseId) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("id").descending());

        ClassStatus classStatus = null;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            try {
                classStatus = ClassStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Keep classStatus as null
            }
        }

        String searchKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;

        Page<ClassEntity> classPage = classRepository.searchClasses(searchKeyword, classStatus, courseId, pageable);
        return classPage.map(classMapper::toSummaryDTO);
    }

    @Override
    public ClassRequestDTO getClassById(Long id) {
        ClassEntity clazz = classRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học với ID: " + id));
        return classMapper.toRequestDTO(clazz);
    }

    @Override
    @Transactional
    public void createClass(ClassRequestDTO dto) {
        if (dto.getClassCode() == null || dto.getClassCode().isBlank()) {
            throw new IllegalArgumentException("Mã lớp học không được để trống!");
        }
        if (dto.getClassName() == null || dto.getClassName().isBlank()) {
            throw new IllegalArgumentException("Tên lớp học không được để trống!");
        }

        String code = dto.getClassCode().trim().toUpperCase();
        
        // Validate classCode uniqueness (case-insensitive checking usually via Jpa, we can check by finding or mapping)
        // We can check if any class code exists
        boolean codeExists = classRepository.findAll().stream()
                .anyMatch(c -> c.getClassCode().equalsIgnoreCase(code));
        if (codeExists) {
            throw new IllegalArgumentException("Mã lớp học '" + code + "' đã tồn tại!");
        }

        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học liên kết!"));

        if (dto.getRoom() != null && !dto.getRoom().isBlank()) {
            String roomName = dto.getRoom().trim();
            Optional<Classroom> classroomOpt = classroomRepository.findByNameIgnoreCase(roomName);
            if (classroomOpt.isPresent()) {
                Classroom classroom = classroomOpt.get();
                if (dto.getMaxStudents() != null && dto.getMaxStudents() > classroom.getCapacity()) {
                    throw new IllegalArgumentException("Sĩ số tối đa không được lớn hơn sức chứa phòng học (" + classroom.getCapacity() + " học viên)!");
                }
            }
        }

        ClassEntity clazz = new ClassEntity();
        clazz.setCourse(course);
        
        classMapper.updateEntityFromDTO(dto, clazz);
        clazz.setClassCode(code); // ensure uppercase

        if (dto.getTeacherId() != null) {
            StaffProfile teacher = staffProfileRepository.findById(dto.getTeacherId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giáo viên!"));
            clazz.setTeacher(teacher);
        }

        if (dto.getTaId() != null) {
            StaffProfile ta = staffProfileRepository.findById(dto.getTaId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy trợ giảng!"));
            clazz.setTa(ta);
        }

        if (dto.getSchedules() != null) {
            List<Schedule> schedules = new ArrayList<>();
            for (ScheduleRequestDTO sDto : dto.getSchedules()) {
                if (sDto.getDayOfWeek() == null) {
                    throw new IllegalArgumentException("Thứ trong tuần không được để trống!");
                }
                if (sDto.getStartTime() == null || sDto.getStartTime().isBlank()) {
                    throw new IllegalArgumentException("Giờ vào học không được để trống!");
                }
                if (sDto.getEndTime() == null || sDto.getEndTime().isBlank()) {
                    throw new IllegalArgumentException("Giờ kết thúc không được để trống!");
                }
                Schedule schedule = new Schedule();
                schedule.setDayOfWeek(sDto.getDayOfWeek());
                
                java.time.LocalTime start, end;
                try {
                    start = java.time.LocalTime.parse(sDto.getStartTime());
                } catch (Exception e) {
                    throw new IllegalArgumentException("Định dạng giờ vào học không hợp lệ!");
                }
                try {
                    end = java.time.LocalTime.parse(sDto.getEndTime());
                } catch (Exception e) {
                    throw new IllegalArgumentException("Định dạng giờ kết thúc không hợp lệ!");
                }
                
                if (!start.isBefore(end)) {
                    throw new IllegalArgumentException("Giờ vào học phải trước giờ kết thúc!");
                }
                
                schedule.setStartTime(start);
                schedule.setEndTime(end);
                schedule.setClassEntity(clazz);
                schedules.add(schedule);
            }
            clazz.setSchedules(schedules);
        }

        classRepository.save(clazz);
        
        java.util.Map<String, Object> newMap = new java.util.LinkedHashMap<>();
        newMap.put("classCode", clazz.getClassCode());
        newMap.put("className", clazz.getClassName());
        newMap.put("maxStudents", clazz.getMaxStudents());
        newMap.put("startDate", clazz.getStartDate() == null ? "" : clazz.getStartDate().toString());
        newMap.put("totalSessions", clazz.getTotalSessions());
        newMap.put("teacher", clazz.getTeacher() == null ? "Chưa phân công" : clazz.getTeacher().getUser().getFullName());
        newMap.put("ta", clazz.getTa() == null ? "Chưa phân công" : clazz.getTa().getUser().getFullName());

        auditLogService.log("CREATE_CLASS", "tạo mới lớp học: " + clazz.getClassName() + " (" + clazz.getClassCode() + ").", "ClassEntity", clazz.getId(), null, newMap);
    }

    @Override
    @Transactional
    public void updateClass(Long id, ClassRequestDTO dto) {
        ClassEntity clazz = classRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học!"));

        java.util.Map<String, Object> oldMap = new java.util.LinkedHashMap<>();
        oldMap.put("classCode", clazz.getClassCode());
        oldMap.put("className", clazz.getClassName());
        oldMap.put("maxStudents", clazz.getMaxStudents());
        oldMap.put("startDate", clazz.getStartDate() == null ? "" : clazz.getStartDate().toString());
        oldMap.put("totalSessions", clazz.getTotalSessions());
        oldMap.put("teacher", clazz.getTeacher() == null ? "Chưa phân công" : clazz.getTeacher().getUser().getFullName());
        oldMap.put("ta", clazz.getTa() == null ? "Chưa phân công" : clazz.getTa().getUser().getFullName());

        if (dto.getClassName() == null || dto.getClassName().isBlank()) {
            throw new IllegalArgumentException("Tên lớp học không được để trống!");
        }

        if (dto.getClassCode() != null && !dto.getClassCode().isBlank()) {
            String newCode = dto.getClassCode().trim().toUpperCase();
            if (!clazz.getClassCode().equalsIgnoreCase(newCode)) {
                boolean codeExists = classRepository.findAll().stream()
                        .anyMatch(c -> c.getClassCode().equalsIgnoreCase(newCode));
                if (codeExists) {
                    throw new IllegalArgumentException("Mã lớp học '" + newCode + "' đã tồn tại!");
                }
                clazz.setClassCode(newCode);
            }
        }

        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học liên kết!"));

        if (dto.getRoom() != null && !dto.getRoom().isBlank()) {
            String roomName = dto.getRoom().trim();
            Optional<Classroom> classroomOpt = classroomRepository.findByNameIgnoreCase(roomName);
            if (classroomOpt.isPresent()) {
                Classroom classroom = classroomOpt.get();
                if (dto.getMaxStudents() != null && dto.getMaxStudents() > classroom.getCapacity()) {
                    throw new IllegalArgumentException("Sĩ số tối đa không được lớn hơn sức chứa phòng học (" + classroom.getCapacity() + " học viên)!");
                }
            }
        }

        clazz.setCourse(course);

        classMapper.updateEntityFromDTO(dto, clazz);

        if (dto.getTeacherId() != null) {
            StaffProfile teacher = staffProfileRepository.findById(dto.getTeacherId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giáo viên!"));
            clazz.setTeacher(teacher);
        } else {
            clazz.setTeacher(null);
        }

        if (dto.getTaId() != null) {
            StaffProfile ta = staffProfileRepository.findById(dto.getTaId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy trợ giảng!"));
            clazz.setTa(ta);
        } else {
            clazz.setTa(null);
        }

        if (clazz.getSchedules() != null) {
            clazz.getSchedules().clear();
        } else {
            clazz.setSchedules(new ArrayList<>());
        }
        if (dto.getSchedules() != null) {
            for (ScheduleRequestDTO sDto : dto.getSchedules()) {
                if (sDto.getDayOfWeek() == null) {
                    throw new IllegalArgumentException("Thứ trong tuần không được để trống!");
                }
                if (sDto.getStartTime() == null || sDto.getStartTime().isBlank()) {
                    throw new IllegalArgumentException("Giờ vào học không được để trống!");
                }
                if (sDto.getEndTime() == null || sDto.getEndTime().isBlank()) {
                    throw new IllegalArgumentException("Giờ kết thúc không được để trống!");
                }
                Schedule schedule = new Schedule();
                schedule.setDayOfWeek(sDto.getDayOfWeek());
                
                LocalTime start, end;
                try {
                    start = LocalTime.parse(sDto.getStartTime());
                } catch (Exception e) {
                    throw new IllegalArgumentException("Định dạng giờ vào học không hợp lệ!");
                }
                try {
                    end = LocalTime.parse(sDto.getEndTime());
                } catch (Exception e) {
                    throw new IllegalArgumentException("Định dạng giờ kết thúc không hợp lệ!");
                }
                
                if (!start.isBefore(end)) {
                    throw new IllegalArgumentException("Giờ vào học phải trước giờ kết thúc!");
                }
                
                schedule.setStartTime(start);
                schedule.setEndTime(end);
                schedule.setClassEntity(clazz);
                clazz.getSchedules().add(schedule);
            }
        }

        classRepository.save(clazz);

        java.util.Map<String, Object> newMap = new java.util.LinkedHashMap<>();
        newMap.put("classCode", clazz.getClassCode());
        newMap.put("className", clazz.getClassName());
        newMap.put("maxStudents", clazz.getMaxStudents());
        newMap.put("startDate", clazz.getStartDate() == null ? "" : clazz.getStartDate().toString());
        newMap.put("totalSessions", clazz.getTotalSessions());
        newMap.put("teacher", clazz.getTeacher() == null ? "Chưa phân công" : clazz.getTeacher().getUser().getFullName());
        newMap.put("ta", clazz.getTa() == null ? "Chưa phân công" : clazz.getTa().getUser().getFullName());

        auditLogService.log("UPDATE_CLASS", "cập nhật lớp học: " + clazz.getClassName() + " (" + clazz.getClassCode() + ").", "ClassEntity", clazz.getId(), oldMap, newMap);
    }

    @Override
    @Transactional
    public void deleteClass(Long id) {
        ClassEntity clazz = classRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học!"));

        if (clazz.getStudents() != null && !clazz.getStudents().isEmpty()) {
            throw new IllegalArgumentException("Không thể xóa lớp học đã có học viên đăng ký!");
        }

        classRepository.delete(clazz);
        auditLogService.log("DELETE_CLASS", "xóa lớp học: " + clazz.getClassName() + " (" + clazz.getClassCode() + ").");
    }

    @Override
    @Transactional
    public void updateClassRoom(Long id, String room) {
        ClassEntity clazz = classRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học!"));
        
        if (room != null && !room.isBlank()) {
            String roomName = room.trim();
            Optional<Classroom> classroomOpt = classroomRepository.findByNameIgnoreCase(roomName);
            if (classroomOpt.isPresent()) {
                Classroom classroom = classroomOpt.get();
                if (clazz.getMaxStudents() != null && clazz.getMaxStudents() > classroom.getCapacity()) {
                    throw new IllegalArgumentException("Sĩ số tối đa không được lớn hơn sức chứa phòng học (" + classroom.getCapacity() + " học viên)!");
                }
            }
        }
        
        clazz.setRoom(room != null ? room.trim() : null);
        classRepository.save(clazz);
    }

    @Override
    @Transactional
    public ClassDetailResponseDTO getClassDetail(Long id) {
        ClassEntity clazz = classRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học với ID: " + id));
        
        // Force initialize lazy relationships within transaction boundary
        if (clazz.getStudents() != null) {
            clazz.getStudents().size(); // force load list
            for (org.megadiiiii.elms_api.models.StudentProfile s : clazz.getStudents()) {
                if (s.getUser() != null) {
                    s.getUser().getId(); // force load User proxy
                }
            }
        }
        if (clazz.getSchedules() != null) {
            clazz.getSchedules().size(); // force load schedules
        }
        if (clazz.getTeacher() != null && clazz.getTeacher().getUser() != null) {
            clazz.getTeacher().getUser().getId();
        }
        if (clazz.getTa() != null && clazz.getTa().getUser() != null) {
            clazz.getTa().getUser().getId();
        }
        
        return classMapper.toDetailDTO(clazz);
    }

    @Override
    @Transactional
    public void enrollStudent(Long classId, Long studentId) {
        ClassEntity clazz = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học với ID: " + classId));
        
        if (clazz.getStatus() == ClassStatus.FINISHED) {
            throw new IllegalArgumentException("Không thể thêm học viên vào lớp học đã kết thúc!");
        }
        if (clazz.getStatus() == ClassStatus.CANCELLED) {
            throw new IllegalArgumentException("Không thể thêm học viên vào lớp học đã bị hủy!");
        }
        
        User user = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản học viên với ID: " + studentId));
        
        StudentProfile student = user.getStudentProfile();
        if (student == null) {
            throw new IllegalArgumentException("Người dùng với ID: " + studentId + " không phải là học viên hoặc không có hồ sơ!");
        }

        if (clazz.getStudents() == null) {
            clazz.setStudents(new ArrayList<>());
        }

        boolean alreadyEnrolled = clazz.getStudents().stream()
                .anyMatch(s -> s.getId().equals(studentId));
        if (alreadyEnrolled) {
            throw new IllegalArgumentException("Học viên '" + student.getUser().getFullName() + "' đã đăng ký lớp học này rồi!");
        }

        if (clazz.getMaxStudents() != null && clazz.getStudents().size() >= clazz.getMaxStudents()) {
            throw new IllegalArgumentException("Lớp học đã đạt sĩ số tối đa (" + clazz.getMaxStudents() + " học viên)!");
        }

        clazz.getStudents().add(student);
        classRepository.save(clazz);

        // Audit Log
        java.util.Map<String, Object> newMap = new java.util.LinkedHashMap<>();
        newMap.put("classCode", clazz.getClassCode());
        newMap.put("className", clazz.getClassName());
        newMap.put("studentName", student.getUser().getFullName());
        newMap.put("studentCode", student.getStudentCode());

        auditLogService.log("ENROLL_STUDENT", "thêm học viên " + student.getUser().getFullName() + " vào lớp " + clazz.getClassName() + " (" + clazz.getClassCode() + ").", "ClassEntity", clazz.getId(), null, newMap);
    }

    @Override
    @Transactional
    public void enrollStudents(Long classId, List<Long> studentIds) {
        ClassEntity clazz = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học với ID: " + classId));
        
        if (clazz.getStatus() == ClassStatus.FINISHED) {
            throw new IllegalArgumentException("Không thể thêm học viên vào lớp học đã kết thúc!");
        }
        if (clazz.getStatus() == ClassStatus.CANCELLED) {
            throw new IllegalArgumentException("Không thể thêm học viên vào lớp học đã bị hủy!");
        }
        
        if (clazz.getStudents() == null) {
            clazz.setStudents(new ArrayList<>());
        }

        int currentStudents = clazz.getStudents().size();
        int maxStudents = clazz.getMaxStudents() != null ? clazz.getMaxStudents() : Integer.MAX_VALUE;

        for (Long studentId : studentIds) {
            User user = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản học viên với ID: " + studentId));
            
            StudentProfile student = user.getStudentProfile();
            if (student == null) {
                throw new IllegalArgumentException("Người dùng '" + user.getFullName() + "' không phải là học viên hoặc không có hồ sơ!");
            }

            boolean alreadyEnrolled = clazz.getStudents().stream()
                    .anyMatch(s -> s.getId().equals(studentId));
            if (alreadyEnrolled) {
                throw new IllegalArgumentException("Học viên '" + student.getUser().getFullName() + "' đã đăng ký lớp học này rồi!");
            }

            if (currentStudents >= maxStudents) {
                throw new IllegalArgumentException("Lớp học đã đạt sĩ số tối đa (" + maxStudents + " học viên)!");
            }

            clazz.getStudents().add(student);
            currentStudents++;
        }
        classRepository.save(clazz);

        // Audit Log for each enrolled student
        for (Long studentId : studentIds) {
            User u = studentRepository.findById(studentId).orElse(null);
            if (u != null && u.getStudentProfile() != null) {
                StudentProfile sp = u.getStudentProfile();
                java.util.Map<String, Object> newMap = new java.util.LinkedHashMap<>();
                newMap.put("classCode", clazz.getClassCode());
                newMap.put("className", clazz.getClassName());
                newMap.put("studentName", sp.getUser().getFullName());
                newMap.put("studentCode", sp.getStudentCode());

                auditLogService.log("ENROLL_STUDENT", "thêm học viên " + sp.getUser().getFullName() + " vào lớp " + clazz.getClassName() + " (" + clazz.getClassCode() + ").", "ClassEntity", clazz.getId(), null, newMap);
            }
        }
    }

    @Override
    @Transactional
    public void removeStudent(Long classId, Long studentId) {
        ClassEntity clazz = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học với ID: " + classId));

        if (clazz.getStudents() == null || clazz.getStudents().isEmpty()) {
            throw new IllegalArgumentException("Lớp học này hiện chưa có học viên nào!");
        }

        StudentProfile studentToRemove = clazz.getStudents().stream()
                .filter(s -> s.getId().equals(studentId))
                .findFirst().orElse(null);

        boolean removed = clazz.getStudents().removeIf(s -> s.getId().equals(studentId));
        if (!removed) {
            throw new IllegalArgumentException("Học viên không có trong lớp học này!");
        }

        classRepository.save(clazz);

        if (studentToRemove != null) {
            java.util.Map<String, Object> oldMap = new java.util.LinkedHashMap<>();
            oldMap.put("classCode", clazz.getClassCode());
            oldMap.put("className", clazz.getClassName());
            oldMap.put("studentName", studentToRemove.getUser().getFullName());
            oldMap.put("studentCode", studentToRemove.getStudentCode());

            auditLogService.log("REMOVE_STUDENT", "xóa học viên " + studentToRemove.getUser().getFullName() + " khỏi lớp " + clazz.getClassName() + " (" + clazz.getClassCode() + ").", "ClassEntity", clazz.getId(), oldMap, null);
        }
    }

    @Override
    @Transactional
    public void transferStudent(Long sourceClassId, Long studentId, Long targetClassId) {
        if (sourceClassId.equals(targetClassId)) {
            throw new IllegalArgumentException("Lớp học đích phải khác lớp học hiện tại!");
        }

        ClassEntity sourceClass = classRepository.findById(sourceClassId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học hiện tại với ID: " + sourceClassId));

        ClassEntity targetClass = classRepository.findById(targetClassId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học đích với ID: " + targetClassId));

        User user = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản học viên với ID: " + studentId));

        StudentProfile student = user.getStudentProfile();
        if (student == null) {
            throw new IllegalArgumentException("Người dùng với ID: " + studentId + " không phải là học viên hoặc không có hồ sơ!");
        }

        // Check if student is in source class (comparing by ID)
        boolean inSource = sourceClass.getStudents() != null && sourceClass.getStudents().stream()
                .anyMatch(s -> s.getId().equals(studentId));
        if (!inSource) {
            throw new IllegalArgumentException("Học viên không có trong lớp học hiện tại!");
        }

        // Check if student is already in target class (comparing by ID)
        boolean inTarget = targetClass.getStudents() != null && targetClass.getStudents().stream()
                .anyMatch(s -> s.getId().equals(studentId));
        if (inTarget) {
            throw new IllegalArgumentException("Học viên đã có mặt trong lớp học đích rồi!");
        }

        // Check target class capacity
        int currentStudents = targetClass.getStudents() == null ? 0 : targetClass.getStudents().size();
        int maxStudents = targetClass.getMaxStudents() == null ? 0 : targetClass.getMaxStudents();
        if (maxStudents > 0 && currentStudents >= maxStudents) {
            throw new IllegalArgumentException("Lớp học đích '" + targetClass.getClassName() + "' đã đạt sĩ số tối đa (" + maxStudents + " học viên)!");
        }

        // Perform transfer
        sourceClass.getStudents().removeIf(s -> s.getId().equals(studentId));
        if (targetClass.getStudents() == null) {
            targetClass.setStudents(new ArrayList<>());
        }
        targetClass.getStudents().add(student);

        classRepository.save(sourceClass);
        classRepository.save(targetClass);

        // Audit Log
        java.util.Map<String, Object> oldMap = new java.util.LinkedHashMap<>();
        oldMap.put("fromClass", sourceClass.getClassName() + " (" + sourceClass.getClassCode() + ")");
        oldMap.put("studentName", student.getUser().getFullName());

        java.util.Map<String, Object> newMap = new java.util.LinkedHashMap<>();
        newMap.put("toClass", targetClass.getClassName() + " (" + targetClass.getClassCode() + ")");
        newMap.put("studentName", student.getUser().getFullName());

        auditLogService.log("TRANSFER_STUDENT", "chuyển học viên " + student.getUser().getFullName() + " từ lớp " + sourceClass.getClassName() + " sang lớp " + targetClass.getClassName() + ".", "ClassEntity", targetClass.getId(), oldMap, newMap);
    }
}
