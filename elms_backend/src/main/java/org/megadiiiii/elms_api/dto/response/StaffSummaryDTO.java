package org.megadiiiii.elms_api.dto.response;

import org.megadiiiii.elms_api.constant.RoleType;
import org.megadiiiii.elms_api.constant.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StaffSummaryDTO {
    private Long id;
    private String username;
    private String staffCode;
    private String fullName;
    private String email;
    private RoleType roleName;
    private UserStatus userStatus;
    private String avatar;
}