package org.megadiiiii.elms_api.services.impl;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.dto.request.GradeRequestDTO;
import org.megadiiiii.elms_api.dto.response.StudentGradeResponseDTO;
import org.megadiiiii.elms_api.models.*;
import org.megadiiiii.elms_api.repository.ClassRepository;
import org.megadiiiii.elms_api.repository.GradeRepository;
import org.megadiiiii.elms_api.repository.UserRepository;
import org.megadiiiii.elms_api.services.EmailService;
import org.megadiiiii.elms_api.services.GradeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradeServiceImpl implements GradeService {

    private final GradeRepository gradeRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public List<StudentGradeResponseDTO> getClassGrades(Long classId, String gradeType) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học!"));

        // Lấy tất cả điểm hiện tại của lớp theo loại điểm (Thường xuyên / Cuối khóa)
        List<Grade> existingGrades = gradeRepository.findByClazzIdAndGradeType(classId, gradeType);
        Map<Long, Grade> studentGradeMap = existingGrades.stream()
                .collect(Collectors.toMap(g -> g.getStudentProfile().getId(), g -> g));

        // Duyệt qua danh sách học viên trong lớp
        List<StudentGradeResponseDTO> responseList = new ArrayList<>();
        for (StudentProfile student : classEntity.getStudents()) {
            User user = student.getUser();
            Grade grade = studentGradeMap.get(student.getId());

            StudentGradeResponseDTO.StudentGradeResponseDTOBuilder builder = StudentGradeResponseDTO.builder()
                    .studentId(student.getId())
                    .studentCode(student.getStudentCode())
                    .fullName(user.getFullName())
                    .studentNickname(student.getStudentNickname())
                    .avatar(user.getAvatar())
                    .gradeType(gradeType);

            if (grade != null) {
                builder.gradeId(grade.getId())
                        .listening(grade.getListening())
                        .speaking(grade.getSpeaking())
                        .reading(grade.getReading())
                        .writing(grade.getWriting())
                        .finalGrade(grade.getFinalGrade())
                        .feedback(grade.getFeedback())
                        .isContacted(grade.isContacted());
            } else {
                // Giá trị mặc định nếu chưa chấm điểm
                builder.gradeId(null)
                        .listening(0.0)
                        .speaking(0.0)
                        .reading(0.0)
                        .writing(0.0)
                        .finalGrade(0.0)
                        .feedback("")
                        .isContacted(false);
            }

            responseList.add(builder.build());
        }

        return responseList;
    }

    @Override
    @Transactional
    public void saveClassGrades(Long classId, String gradeType, List<GradeRequestDTO> requests) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học!"));

        for (GradeRequestDTO request : requests) {
            // Kiểm tra xem học viên có trong lớp không
            boolean isEnrolled = classEntity.getStudents().stream()
                    .anyMatch(s -> s.getId().equals(request.getStudentId()));

            if (!isEnrolled) {
                throw new IllegalArgumentException("Học viên với ID " + request.getStudentId() + " không thuộc lớp này!");
            }

            // Tìm điểm cũ hoặc tạo mới
            Optional<Grade> gradeOpt = gradeRepository.findByStudentProfileIdAndClazzIdAndGradeType(request.getStudentId(), classId, gradeType);
            Grade grade;

            if (gradeOpt.isPresent()) {
                grade = gradeOpt.get();
            } else {
                grade = new Grade();
                grade.setClazz(classEntity);
                grade.setGradeType(gradeType);
                
                User user = userRepository.findById(request.getStudentId())
                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học viên!"));
                if (user.getStudentProfile() == null) {
                    throw new IllegalArgumentException("Học viên này không có hồ sơ học sinh!");
                }
                grade.setStudentProfile(user.getStudentProfile());
            }

            // Cập nhật điểm số 4 kỹ năng
            grade.setListening(request.getListening() != null ? request.getListening() : 0.0);
            grade.setSpeaking(request.getSpeaking() != null ? request.getSpeaking() : 0.0);
            grade.setReading(request.getReading() != null ? request.getReading() : 0.0);
            grade.setWriting(request.getWriting() != null ? request.getWriting() : 0.0);
            
            // Tính toán hoặc nhận điểm cuối kỳ
            if (request.getFinalGrade() != null) {
                grade.setFinalGrade(request.getFinalGrade());
            } else {
                double avg = (grade.getListening() + grade.getSpeaking() + grade.getReading() + grade.getWriting()) / 4.0;
                // Làm tròn theo chuẩn IELTS
                grade.setFinalGrade(roundToIelts(avg));
            }
            
            grade.setFeedback(request.getFeedback());

            gradeRepository.save(grade);
        }
    }

    @Override
    @Transactional
    public void sendGradeReport(Long classId, Long studentId, String gradeType) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học!"));

        Grade grade = gradeRepository.findByStudentProfileIdAndClazzIdAndGradeType(studentId, classId, gradeType)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy điểm số của học viên trong lớp này để báo cáo!"));

        // Tìm email nhận báo cáo (ưu tiên Email phụ huynh nếu có, nếu không thì gửi trực tiếp cho học viên)
        StudentProfile student = grade.getStudentProfile();
        String toEmail = student.getParentEmail();
        if (toEmail == null || toEmail.trim().isEmpty()) {
            toEmail = student.getUser().getEmail();
        }

        if (toEmail == null || toEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy email liên hệ của học viên hoặc phụ huynh!");
        }

        // Lấy thông tin TA hoặc giáo viên phụ trách để gửi trong mail làm liên hệ
        String taName = "Hệ thống ELMS";
        String taPhone = "";
        String taEmail = "elms.system.lab@gmail.com";

        if (classEntity.getTa() != null) {
            User taUser = classEntity.getTa().getUser();
            taName = taUser.getFullName();
            taPhone = taUser.getPhone();
            taEmail = taUser.getEmail();
        } else if (classEntity.getTeacher() != null) {
            User teacherUser = classEntity.getTeacher().getUser();
            taName = teacherUser.getFullName();
            taPhone = teacherUser.getPhone();
            taEmail = teacherUser.getEmail();
        }

        // Thực hiện gửi mail báo cáo
        emailService.sendGradeReport(toEmail, grade, taName, taPhone, taEmail, grade.getFeedback());

        // Đánh dấu là đã liên hệ thành công
        grade.setContacted(true);
        gradeRepository.save(grade);
    }

    private double roundToIelts(double avg) {
        double floorVal = Math.floor(avg);
        double remainder = avg - floorVal;
        if (remainder < 0.25) {
            return floorVal;
        } else if (remainder < 0.75) {
            return floorVal + 0.5;
        } else {
            return floorVal + 1.0;
        }
    }
}
