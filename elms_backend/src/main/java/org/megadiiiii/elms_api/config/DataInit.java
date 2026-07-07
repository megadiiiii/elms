package org.megadiiiii.elms_api.config; // Đổi chuẩn package mới

import org.megadiiiii.elms_api.constant.RoleType;
import org.megadiiiii.elms_api.models.Role;
import org.megadiiiii.elms_api.models.StaffProfile;
import org.megadiiiii.elms_api.models.User;
import org.megadiiiii.elms_api.repository.RoleRepository;
import org.megadiiiii.elms_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.megadiiiii.elms_api.constant.UserStatus;

@Component
public class DataInit implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createRoleIfNotFound(RoleType.ADMIN);
        createRoleIfNotFound(RoleType.TEACHER);
        createRoleIfNotFound(RoleType.TA);
        createRoleIfNotFound(RoleType.STUDENT);

        // 2. Tạo tài khoản Admin mặc định
        if (userRepository.findByEmail("admin@elms.com").isEmpty()) {
            Role adminRole = roleRepository.findByName(RoleType.ADMIN).orElseThrow();

            User admin = new User();
            admin.setEmail("admin@elms.com");
            admin.setUsername("admin");

            admin.setPassword(passwordEncoder.encode("admin123"));

            admin.setRole(adminRole);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setFullName("System Admin");
            admin.setAvatar("default-avatar.png");

            StaffProfile profile = StaffProfile.builder()
                    .staffCode("AD-SYSTEM")
                    .user(admin)
                    .build();

            admin.setStaffProfile(profile);
            userRepository.save(admin);
        }
    }

    private void createRoleIfNotFound(RoleType name) {
        if (roleRepository.findByName(name).isEmpty()) {
            Role role = new Role();
            role.setName(name);
            roleRepository.save(role);
        }
    }
}