package org.megadiiiii.elms_api.dto.response;

import org.megadiiiii.elms_api.constant.RoleType;
import org.megadiiiii.elms_api.constant.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StaffDetailDTO {
    private Long id;
    private String username;
    private String staffCode;
    private String fullName;
    private RoleType roleName;
    private UserStatus userStatus;
    private String avatar;
    private String gender;
    private LocalDate dob;
    private String phone;
    private String email;
    private String address;
    private String nationality;
}