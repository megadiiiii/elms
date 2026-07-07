package org.megadiiiii.elms_api.mappers;

import org.megadiiiii.elms_api.dto.request.StaffRequestDTO;
import org.megadiiiii.elms_api.models.User;
import org.springframework.stereotype.Component;

@Component
public class StaffMapper {
    public StaffRequestDTO toRequestDTO(User user) {
        if (user == null) return null;

        StaffRequestDTO dto = new StaffRequestDTO();

        if (user.getRole() != null) {
            dto.setRoleId(user.getRole().getId());
        }
        dto.setEmail(user.getEmail());
        dto.setStaffName(user.getFullName());
        dto.setStaffPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setGender(user.getGender());
        dto.setDob(user.getDob());
        dto.setNationality(user.getNationality());
        dto.setAvatarUrl(user.getAvatar());

        return dto;
    }

    public void updateEntityFromDTO(StaffRequestDTO dto, User user) {
        if (dto == null || user == null) return;

        user.setEmail(dto.getEmail());
        user.setFullName(dto.getStaffName());
        user.setPhone(dto.getStaffPhone());
        user.setAddress(dto.getAddress());
        user.setGender(dto.getGender());
        user.setDob(dto.getDob());
        user.setNationality(dto.getNationality());
        user.setAvatar(dto.getAvatarUrl());
    }
}