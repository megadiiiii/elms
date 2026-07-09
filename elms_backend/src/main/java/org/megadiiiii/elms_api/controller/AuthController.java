package org.megadiiiii.elms_api.controller;

import org.megadiiiii.elms_api.services.AuditLogService;
import org.megadiiiii.elms_api.dto.request.LoginRequest;
import org.megadiiiii.elms_api.dto.response.AuthResponse;
import org.megadiiiii.elms_api.security.CustomUserDetails;
import org.megadiiiii.elms_api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.Map;

/**
 * Controller xử lý các tác vụ liên quan đến xác thực và phân quyền hệ thống.
 * Cung cấp các endpoint công khai phục vụ cho luồng đăng nhập của người dùng.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    /**
     * Endpoint xử lý yêu cầu đăng nhập từ phía khách hàng (Frontend).
     * Thực hiện kiểm tra thông tin tài khoản, xác thực mật khẩu và cấp phát JWT Token.
     * * @param loginRequest Đối tượng chứa thông tin tài khoản và mật khẩu định dạng JSON
     * @return ResponseEntity chứa thông tin xác thực AuthResponse nếu thành công
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // 1. Thực hiện xác thực thông tin đăng nhập (Username/Email và Password) thông qua AuthenticationManager
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            // 2. Nếu thông tin hợp lệ, lưu trữ đối tượng xác thực vào SecurityContext của hệ thống
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 3. Truy xuất thông tin chi tiết của người dùng hiện tại từ đối tượng Principal
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            // 4. Khởi tạo chuỗi mã định danh JSON Web Token (JWT) dựa trên thông tin định danh của người dùng
            String jwt = tokenProvider.generateToken(userDetails.getUsername());

            // 5. Khởi tạo đối tượng AuthResponse chứa thông tin cấu hình quyền hạn để phản hồi về phía Frontend
            AuthResponse authResponse = AuthResponse.builder()
                    .token(jwt)
                    .username(userDetails.getUsername())
                    .fullName(userDetails.getDisplayName())
                    .role(userDetails.getUser().getRole().getName().name()) // Trả về role (ADMIN, TEACHER, STUDENT...)
                    .build();

            // Ghi nhật ký đăng nhập thành công
            auditLogService.log("LOGIN", "Người dùng " + authResponse.getFullName() + " (" + authResponse.getUsername() + ") đăng nhập thành công.");

            return ResponseEntity.ok(authResponse);
                } catch (BadCredentialsException e) {
                    return ResponseEntity.status(401).body(Map.of("message", "Tên đăng nhập hoặc mật khẩu không chính xác"));
                } catch (DisabledException e) {
                    return ResponseEntity.status(401).body(Map.of("message", "Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa"));
                } catch (Exception e) {
                    return ResponseEntity.status(500).body(Map.of("message", "Lỗi xác thực hệ thống: " + e.getMessage()));
                }
            }
        }