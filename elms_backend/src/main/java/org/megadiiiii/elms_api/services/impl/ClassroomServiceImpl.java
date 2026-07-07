package org.megadiiiii.elms_api.services.impl;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.models.Classroom;
import org.megadiiiii.elms_api.repository.ClassroomRepository;
import org.megadiiiii.elms_api.services.ClassroomService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClassroomServiceImpl implements ClassroomService {

    private final ClassroomRepository classroomRepository;

    @Override
    public Page<Classroom> getClassrooms(int page, int size, String keyword, String status) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("id").descending());
        String searchKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String statusFilter = (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) ? status.toUpperCase() : null;
        return classroomRepository.searchClassrooms(searchKeyword, statusFilter, pageable);
    }

    @Override
    public List<Classroom> getAllClassrooms(String status) {
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            return classroomRepository.findAllByStatus(status.toUpperCase(), Sort.by("name").ascending());
        }
        return classroomRepository.findAll(Sort.by("name").ascending());
    }

    @Override
    public Classroom getClassroomById(Long id) {
        return classroomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng học với ID: " + id));
    }

    @Override
    @Transactional
    public Classroom createClassroom(Classroom classroom) {
        if (classroom.getName() == null || classroom.getName().isBlank()) {
            throw new IllegalArgumentException("Tên phòng học không được để trống!");
        }
        
        String name = classroom.getName().trim();
        if (classroomRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Tên phòng học '" + name + "' đã tồn tại!");
        }
        
        classroom.setName(name);
        if (classroom.getStatus() == null || classroom.getStatus().isBlank()) {
            classroom.setStatus("ACTIVE");
        } else {
            classroom.setStatus(classroom.getStatus().trim().toUpperCase());
        }
        return classroomRepository.save(classroom);
    }

    @Override
    @Transactional
    public Classroom updateClassroom(Long id, Classroom classroom) {
        Classroom existing = classroomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng học với ID: " + id));

        if (classroom.getName() == null || classroom.getName().isBlank()) {
            throw new IllegalArgumentException("Tên phòng học không được để trống!");
        }

        String name = classroom.getName().trim();
        if (classroomRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new IllegalArgumentException("Tên phòng học '" + name + "' đã tồn tại!");
        }

        existing.setName(name);
        existing.setCapacity(classroom.getCapacity());
        existing.setDescription(classroom.getDescription());
        
        if (classroom.getStatus() != null && !classroom.getStatus().isBlank()) {
            existing.setStatus(classroom.getStatus().trim().toUpperCase());
        }

        return classroomRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteClassroom(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng học với ID: " + id));
        
        // Note: Loose coupling means classes just store the room name as a String,
        // so we don't have to restrict deletion based on hard class relationships,
        // or if we want to restrict it, we could query classRepository for classes with room = classroom.getName().
        // Let's do that for extra safety!
        // Wait, does ClassRepository have a count method? Yes, we can check.
        // But loose coupling makes it fine to delete it. Let's just delete it directly.
        classroomRepository.delete(classroom);
    }
}
