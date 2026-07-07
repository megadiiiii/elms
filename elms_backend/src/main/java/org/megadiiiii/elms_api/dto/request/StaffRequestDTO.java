package org.megadiiiii.elms_api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StaffRequestDTO {
    @NotNull(message = "Vui lòng chọn chức vụ")
    private Long roleId; // Dùng cái này để gọi RoleType.fromId(roleId)

    @NotBlank(message = "Họ tên không được để trống")
    private String staffName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "SĐT không được để trống")
    @Pattern(regexp = "^[0-9]{10}$", message = "SĐT phải có 10 số")
    private String staffPhone;

    private String address;

    @NotBlank(message = "Vui lòng chọn giới tính.")
    private String gender;

    @NotBlank(message = "Vui lòng nhập quốc tịch.")
    private String nationality;

    @NotNull(message = "Ngày sinh không được để trống")
    private LocalDate dob;

    private String avatarUrl;
}
