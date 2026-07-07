package org.megadiiiii.elms_api.services;

import org.megadiiiii.elms_api.dto.request.StaffRequestDTO;
import org.megadiiiii.elms_api.dto.response.StaffDetailDTO;
import org.megadiiiii.elms_api.dto.response.StaffSummaryDTO;
import org.megadiiiii.elms_api.models.StaffProfile;
import org.springframework.data.domain.Page;

import java.util.List;

public interface StaffService {
    Page<StaffSummaryDTO> getAllStaffSummaries(int page, int size, String keyword, Long roleId);

    StaffDetailDTO getStaffDetailById(Long id);

    String generateNextStaffCode(Long roleId);

    void createStaff(StaffRequestDTO requestDTO);

    void updateStaff(Long id, StaffRequestDTO requestDTO);

    StaffRequestDTO getStaffRequestById(Long id);

    void resetPassword(Long id);

    String toggleStaffStatus(Long id);

     StaffRequestDTO getStaffById(Long id);

    List<StaffProfile> findByRole(String roleName);
}
