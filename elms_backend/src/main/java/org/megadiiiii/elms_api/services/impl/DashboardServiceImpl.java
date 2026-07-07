package org.megadiiiii.elms_api.services.impl;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.constant.ClassStatus;
import org.megadiiiii.elms_api.constant.CourseStatus;
import org.megadiiiii.elms_api.constant.RoleType;
import org.megadiiiii.elms_api.dto.response.DashboardStatsResponse;
import org.megadiiiii.elms_api.repository.ClassRepository;
import org.megadiiiii.elms_api.repository.CourseRepository;
import org.megadiiiii.elms_api.repository.UserRepository;
import org.megadiiiii.elms_api.services.DashboardService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final ClassRepository clazzRepository;
    private final CourseRepository courseRepository;

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
}
