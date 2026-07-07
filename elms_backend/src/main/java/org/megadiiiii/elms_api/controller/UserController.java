package org.megadiiiii.elms_api.controller;

import org.megadiiiii.elms_api.dto.response.UserDetailDTO;
import org.megadiiiii.elms_api.security.CustomUserDetails;
import org.megadiiiii.elms_api.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller cung cấp các API liên quan đến thông tin và tài khoản của người dùng.
 * Yêu cầu xác thực qua cấu hình JWT Token gác cổng.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    /**
     * API truy xuất thông tin hồ sơ cá nhân (Profile) của người dùng hiện tại đang đăng nhập.
     * Sử dụng @AuthenticationPrincipal để tự động bốc đối tượng xác thực từ SecurityContext.
     * @param userDetails Đối tượng CustomUserDetails chứa thông tin phiên đăng nhập hiện tại
     * @return ResponseEntity chứa dữ liệu hồ sơ UserDetailDTO hợp lệ
     */
    @GetMapping("/profile")
    public ResponseEntity<UserDetailDTO> getCurrentUserProfile(
            @AuthenticationPrincipal final CustomUserDetails userDetails
    ) {
        Long currentUserId = userDetails.getUser().getId();

        UserDetailDTO profile = userService.getProfile(currentUserId);

        return ResponseEntity.ok(profile);
    }

    /**
     * API cập nhật thông tin hồ sơ cá nhân (Profile) của người dùng hiện tại đang đăng nhập.
     * @param userDetails Đối tượng CustomUserDetails chứa thông tin phiên đăng nhập hiện tại
     * @param updateDTO DTO chứa thông tin cần cập nhật
     * @return ResponseEntity chứa thông báo kết quả
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateCurrentUserProfile(
            @AuthenticationPrincipal final CustomUserDetails userDetails,
            @jakarta.validation.Valid @RequestBody UserDetailDTO updateDTO
    ) {
        Long currentUserId = userDetails.getUser().getId();
        userService.updateProfile(currentUserId, updateDTO);
        return ResponseEntity.ok(java.util.Map.of("message", "Cập nhật thông tin cá nhân thành công!"));
    }

    /**
     * API cập nhật mật khẩu mới của người dùng hiện tại đang đăng nhập.
     * @param userDetails Đối tượng CustomUserDetails chứa thông tin phiên đăng nhập hiện tại
     * @param request DTO chứa mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới
     * @return ResponseEntity chứa thông báo kết quả
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal final CustomUserDetails userDetails,
            @jakarta.validation.Valid @RequestBody org.megadiiiii.elms_api.dto.request.PasswordChangeRequest request
    ) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Xác nhận mật khẩu mới không khớp!"));
        }

        try {
            userService.updatePassword(
                    userDetails.getUser().getId(),
                    request.getCurrentPassword(),
                    request.getNewPassword()
            );
            return ResponseEntity.ok(java.util.Map.of("message", "Thay đổi mật khẩu thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }
}