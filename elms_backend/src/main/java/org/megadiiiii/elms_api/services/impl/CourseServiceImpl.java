package org.megadiiiii.elms_api.services.impl;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.constant.CourseStatus;
import org.megadiiiii.elms_api.dto.response.CourseDTO;
import org.megadiiiii.elms_api.dto.response.ClassSummaryResponseDTO;
import org.megadiiiii.elms_api.mappers.CourseMapper;
import org.megadiiiii.elms_api.mappers.ClassMapper;
import org.megadiiiii.elms_api.models.Course;
import org.megadiiiii.elms_api.repository.CourseRepository;
import org.megadiiiii.elms_api.services.CourseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final ClassMapper classMapper;

    @Override
    public Page<CourseDTO> getCourses(int page, int size, String keyword, String status) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("id").descending());
        
        List<CourseStatus> statuses = null;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            try {
                statuses = Collections.singletonList(CourseStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep statuses as null if parse fails
            }
        }

        String searchKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;

        Page<Course> coursePage = courseRepository.findByFilters(searchKeyword, statuses, pageable);
        return coursePage.map(courseMapper::toDTO);
    }

    @Override
    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học với ID: " + id));
        return courseMapper.toDTO(course);
    }

    @Override
    @Transactional
    public CourseDTO createCourse(CourseDTO dto) {
        if (dto.getCourseCode() == null || dto.getCourseCode().isBlank()) {
            throw new IllegalArgumentException("Mã khóa học không được để trống!");
        }
        if (dto.getCourseName() == null || dto.getCourseName().isBlank()) {
            throw new IllegalArgumentException("Tên khóa học không được để trống!");
        }

        String code = dto.getCourseCode().trim().toUpperCase();
        if (courseRepository.findByCourseCode(code).isPresent()) {
            throw new IllegalArgumentException("Mã khóa học '" + code + "' đã tồn tại!");
        }

        Course course = new Course();
        course.setCourseCode(code);
        course.setCourseName(dto.getCourseName().trim());
        
        CourseStatus status = CourseStatus.ACTIVE;
        if (dto.getCourseStatus() != null && !dto.getCourseStatus().isBlank()) {
            try {
                status = CourseStatus.valueOf(dto.getCourseStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Default to ACTIVE
            }
        }
        course.setCourseStatus(status);

        Course savedCourse = courseRepository.save(course);
        return courseMapper.toDTO(savedCourse);
    }

    @Override
    @Transactional
    public CourseDTO updateCourse(Long id, CourseDTO dto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học!"));

        if (dto.getCourseName() == null || dto.getCourseName().isBlank()) {
            throw new IllegalArgumentException("Tên khóa học không được để trống!");
        }

        if (dto.getCourseCode() != null && !dto.getCourseCode().isBlank()) {
            String newCode = dto.getCourseCode().trim().toUpperCase();
            if (!course.getCourseCode().equalsIgnoreCase(newCode)) {
                if (courseRepository.findByCourseCode(newCode).isPresent()) {
                    throw new IllegalArgumentException("Mã khóa học '" + newCode + "' đã tồn tại!");
                }
                course.setCourseCode(newCode);
            }
        }

        course.setCourseName(dto.getCourseName().trim());

        if (dto.getCourseStatus() != null && !dto.getCourseStatus().isBlank()) {
            try {
                CourseStatus status = CourseStatus.valueOf(dto.getCourseStatus().toUpperCase());
                course.setCourseStatus(status);
            } catch (IllegalArgumentException e) {
                // Ignore invalid status
            }
        }

        Course savedCourse = courseRepository.save(course);
        return courseMapper.toDTO(savedCourse);
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học!"));

        if (course.getClassList() != null && !course.getClassList().isEmpty()) {
            throw new IllegalArgumentException("Không thể xóa khóa học đang có lớp học tham chiếu!");
        }

        courseRepository.delete(course);
    }

    @Override
    @Transactional
    public void toggleCourseStatus(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học!"));

        if (course.getCourseStatus() == CourseStatus.ACTIVE) {
            course.setCourseStatus(CourseStatus.INACTIVE);
        } else {
            course.setCourseStatus(CourseStatus.ACTIVE);
        }

        courseRepository.save(course);
    }

    @Override
    public List<ClassSummaryResponseDTO> getClassesByCourseId(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khóa học!"));

        if (course.getClassList() == null) {
            return Collections.emptyList();
        }

        return course.getClassList().stream()
                .map(classMapper::toSummaryDTO)
                .collect(Collectors.toList());
    }
}
