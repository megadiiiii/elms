package org.megadiiiii.elms_api.services;

import org.megadiiiii.elms_api.dto.response.UserDetailDTO;

/**
 * Interface định nghĩa các nghiệp vụ liên quan đến quản lý người dùng.
 */
public interface UserService {
    
    /**
     * Lấy thông tin chi tiết (Profile) của người dùng dựa trên ID.
     * @param userId Định danh của người dùng cần lấy thông tin
     * @return Đối tượng UserDetailDTO chứa thông tin chi tiết phục vụ Frontend
     */
    UserDetailDTO getProfile(Long userId);

    /**
     * Cập nhật thông tin chi tiết (Profile) của người dùng hiện tại.
     * @param userId Định danh người dùng
     * @param updateDTO DTO chứa thông tin cập nhật
     */
    void updateProfile(Long userId, UserDetailDTO updateDTO);

    /**
     * Cập nhật mật khẩu mới của người dùng.
     * @param userId Định danh người dùng
     * @param currentPassword Mật khẩu hiện tại
     * @param newPassword Mật khẩu mới
     */
    void updatePassword(Long userId, String currentPassword, String newPassword);
}