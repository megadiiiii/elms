package org.megadiiiii.elms_api.dto.response;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import org.megadiiiii.elms_api.constant.RoleType;
import org.megadiiiii.elms_api.constant.UserStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailDTO {
    private Long id;
    private String username;
    private String fullName;
    private RoleType roleName;
    private UserStatus status;
    private String avatar;
    private String gender;
    private LocalDate dob;
    private String code;
    private String phone;
    private String email;
    private String address;
    private String nationality;
}