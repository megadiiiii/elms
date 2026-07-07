package org.megadiiiii.elms_api.controller;

import org.megadiiiii.elms_api.dto.request.StaffRequestDTO;
import org.megadiiiii.elms_api.dto.response.StaffDetailDTO;
import org.megadiiiii.elms_api.dto.response.StaffSummaryDTO;
import org.megadiiiii.elms_api.repository.RoleRepository;
import org.megadiiiii.elms_api.repository.StaffRepository;
import org.megadiiiii.elms_api.services.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller phục vụ các API quản lý nhân viên (Staff) dành riêng cho ADMIN.
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class StaffController {

    private final StaffService staffService;
    private final RoleRepository roleRepository;
    private final StaffRepository staffRepository;

    /**
     * Lấy danh sách nhân viên dạng phân trang, lọc theo từ khóa và vai trò.
     * Đồng thời trả về danh sách các vai trò nhân viên và các số liệu đếm tổng quan.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> listUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long roleId
    ) {
        Page<StaffSummaryDTO> staffsPage = staffService.getAllStaffSummaries(page, size, keyword, roleId);
        
        Map<String, Object> response = Map.of(
            "staffsPage", staffsPage,
            "roles", roleRepository.findStaffRoles(),
            "totalStaffs", staffRepository.countAllStaffs(),
            "totalAdmins", staffRepository.countByRoleId(1L),
            "totalTeachers", staffRepository.countByRoleId(2L),
            "totalTAs", staffRepository.countByRoleId(3L)
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Tạo tài khoản nhân viên mới.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> createStaff(@Valid @RequestBody StaffRequestDTO staffRequestDTO) {
        staffService.createStaff(staffRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Tạo tài khoản thành công cho " + staffRequestDTO.getStaffName()
        ));
    }

    /**
     * Lấy thông tin chi tiết (dưới dạng form yêu cầu chỉnh sửa) của một nhân viên.
     */
    @GetMapping("/{id}")
    public ResponseEntity<StaffRequestDTO> getStaffById(@PathVariable Long id) {
        StaffRequestDTO staff = staffService.getStaffRequestById(id);
        return ResponseEntity.ok(staff);
    }

    /**
     * Lấy hồ sơ chi tiết đầy đủ của một nhân viên.
     */
    @GetMapping("/{id}/detail")
    public ResponseEntity<StaffDetailDTO> getStaffDetailById(@PathVariable Long id) {
        StaffDetailDTO detail = staffService.getStaffDetailById(id);
        return ResponseEntity.ok(detail);
    }

    /**
     * Cập nhật thông tin chi tiết nhân viên.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody StaffRequestDTO staffRequestDTO
    ) {
        staffService.updateStaff(id, staffRequestDTO);
        return ResponseEntity.ok(Map.of("message", "Cập nhật nhân viên thành công!"));
    }

    /**
     * Cấp lại mật khẩu ngẫu nhiên cho nhân viên và gửi email thông báo.
     */
    @PostMapping("/reset-password/{id}")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable Long id) {
        staffService.resetPassword(id);
        return ResponseEntity.ok(Map.of("message", "Đã cấp lại mật khẩu mới và gửi về email!"));
    }

    /**
     * Đổi trạng thái Hoạt động / Khóa tài khoản nhân viên.
     */
    @PostMapping("/toggle-status/{id}")
    public ResponseEntity<Map<String, String>> toggleStatus(@PathVariable Long id) {
        String actionName = staffService.toggleStaffStatus(id);
        return ResponseEntity.ok(Map.of("message", actionName + " tài khoản thành công!"));
    }
}
