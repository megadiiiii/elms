package org.megadiiiii.elms_api.services;

import org.megadiiiii.elms_api.models.Classroom;
import org.springframework.data.domain.Page;
import java.util.List;

public interface ClassroomService {
    Page<Classroom> getClassrooms(int page, int size, String keyword, String status);
    
    List<Classroom> getAllClassrooms(String status);
    
    Classroom getClassroomById(Long id);
    
    Classroom createClassroom(Classroom classroom);
    
    Classroom updateClassroom(Long id, Classroom classroom);
    
    void deleteClassroom(Long id);
}
