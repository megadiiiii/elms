package org.megadiiiii.elms_api.services.impl;

import org.megadiiiii.elms_api.dto.response.UserDetailDTO;
import org.megadiiiii.elms_api.models.User;
import org.megadiiiii.elms_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.services.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * Lớp thực thi các nghiệp vụ của UserService, xử lý logic tương tác với Repository.
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetailDTO getProfile(final Long userId) {
        // Gọi câu lệnh JPQL Constructor Expression đã được tối ưu hóa xếp hàng biến ở turn trước
        return userRepository.findUserDetailById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin chi tiết cho người dùng có ID: " + userId));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(rollbackFor = Exception.class)
    public void updateProfile(Long userId, UserDetailDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng!"));

        // 1. Kiểm tra email nếu có thay đổi
        if (dto.getEmail() != null && !user.getEmail().equalsIgnoreCase(dto.getEmail())) {
            userRepository.findByEmail(dto.getEmail()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(user.getId())) {
                    throw new IllegalArgumentException("Email '" + dto.getEmail() + "' đã được sử dụng bởi tài khoản khác!");
                }
            });
            user.setEmail(dto.getEmail());
        }

        // 2. Cập nhật các trường thông tin cơ bản
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getGender() != null) user.setGender(dto.getGender());
        if (dto.getDob() != null) user.setDob(dto.getDob());
        if (dto.getAddress() != null) user.setAddress(dto.getAddress());
        if (dto.getNationality() != null) user.setNationality(dto.getNationality());

        // 3. Cập nhật ảnh đại diện nếu có
        if (dto.getAvatar() != null && !dto.getAvatar().isBlank()) {
            String currentAvatar = user.getAvatar();
            user.setAvatar(dto.getAvatar());
            if (currentAvatar != null && !currentAvatar.equals(dto.getAvatar()) && !currentAvatar.equals("default-avatar.png")) {
                try {
                    Files.deleteIfExists(Paths.get("./uploads/avatars").resolve(currentAvatar));
                } catch (IOException e) {
                    // Bỏ qua lỗi xóa file cũ nếu gặp sự cố
                }
            }
        }

        userRepository.save(user);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(rollbackFor = Exception.class)
    public void updatePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng!"));

        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác!");
        }

        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}