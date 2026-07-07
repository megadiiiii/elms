package org.megadiiiii.elms_api.security; // ĐỔI PACKAGE SANG THẰNG NÀY

import org.megadiiiii.elms_api.models.User;
import org.megadiiiii.elms_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String loginInput) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(loginInput, loginInput)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản: " + loginInput));

        // VÁ LỖI: Trả về đúng Object CustomUserDetails chính chủ của dự án!
        return new CustomUserDetails(user);
    }
}