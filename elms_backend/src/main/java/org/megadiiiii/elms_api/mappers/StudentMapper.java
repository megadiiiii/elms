package org.megadiiiii.elms_api.mappers;

import org.megadiiiii.elms_api.dto.request.StudentRequestDTO;
import org.megadiiiii.elms_api.models.StudentProfile;
import org.megadiiiii.elms_api.models.User;
import org.springframework.stereotype.Component;

@Component
public class StudentMapper {

    public StudentRequestDTO toRequestDTO(User user) {
        if (user == null) return null;

        StudentRequestDTO dto = new StudentRequestDTO();

        dto.setEmail(user.getEmail());
        dto.setStudentName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setGender(user.getGender());
        dto.setDob(user.getDob());
        dto.setNationality(user.getNationality());
        dto.setAvatarUrl(user.getAvatar());

        StudentProfile profile = user.getStudentProfile();
        if (profile != null) {
            dto.setStudentNickname(profile.getStudentNickname());
            dto.setParentName(profile.getParentName());
            dto.setParentPhone(profile.getParentPhone());
            dto.setParentEmail(profile.getParentEmail());
        }

        return dto;
    }

    public void updateEntityFromDTO(StudentRequestDTO dto, User user) {
        if (dto == null || user == null) return;

        user.setEmail(dto.getEmail());
        user.setFullName(dto.getStudentName());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());
        user.setGender(dto.getGender());
        user.setDob(dto.getDob());
        user.setNationality(dto.getNationality());
        user.setAvatar(dto.getAvatarUrl());

        StudentProfile profile = user.getStudentProfile();
        if (profile != null) {
            profile.setStudentNickname(dto.getStudentNickname());
            profile.setParentName(dto.getParentName());
            profile.setParentPhone(dto.getParentPhone());
            profile.setParentEmail(dto.getParentEmail());
        }
    }
}
