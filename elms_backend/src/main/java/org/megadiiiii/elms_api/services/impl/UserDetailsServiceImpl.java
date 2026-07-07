//package org.megadiiiii.elms_api.service.impl;
//
//import org.megadiiiii.elms_api.models.User;
//import org.megadiiiii.elms_api.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class UserDetailsServiceImpl implements UserDetailsService {
//
//    private final UserRepository userRepository;
//
//    @Override
//    public UserDetails loadUserByUsername(String loginInput) throws UsernameNotFoundException {
//        User user = userRepository.findByUsernameOrEmail(loginInput, loginInput)
//                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản: " + loginInput));
//
//        String roleName = "USER";
//        if (user.getRole() != null && user.getRole().getName() != null) {
//            roleName = user.getRole().getName().name();
//        }
//
//        if (!roleName.startsWith("ROLE_")) {
//            roleName = "ROLE_" + roleName;
//        }
//
//        return org.springframework.security.core.userdetails.User
//                .withUsername(user.getUsername())
//                .password(user.getPassword())
//                .authorities(new SimpleGrantedAuthority(roleName))
//                .build();
//    }
//}