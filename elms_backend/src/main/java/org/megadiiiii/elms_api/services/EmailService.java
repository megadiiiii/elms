package org.megadiiiii.elms_api.services;

import org.megadiiiii.elms_api.models.Grade;

public interface EmailService {
    void sendAccountInfo(String toEmail, String username, String rawPassword, String roleName);

    void sendResetPassword(String toEmail, String username, String newPassword);

    void sendGradeReport(String toEmail, Grade grade, String taName, String taPhone, String taEmail, String comment);
}
