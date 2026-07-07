package org.megadiiiii.elms_api.dto.response;

import org.megadiiiii.elms_api.constant.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDetailDTO {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dob;
    private String address;
    private String nationality;
    private String avatar;
    private UserStatus status;

    private String studentCode;
    private String studentNickname;
    private String parentName;
    private String parentPhone;
    private String parentEmail;
}