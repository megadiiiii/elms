package org.megadiiiii.elms_api.dto.response;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.megadiiiii.elms_api.constant.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentSummaryDTO {
    private Long id;
    private String studentCode;
    private String fullName;
    private String studentNickname;
    private UserStatus status;
    private String avatar;
    private String email;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dob;
    private String nationality;
}