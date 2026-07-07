package org.megadiiiii.elms_api.services.impl;

import org.megadiiiii.elms_api.models.Grade;
import org.megadiiiii.elms_api.services.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Async
    @Override
    public void sendAccountInfo(String toEmail, String username, String rawPassword, String roleName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("elms.system.lab@gmail.com", "HỆ THỐNG ELMS");
            helper.setTo(toEmail);
            helper.setSubject("[ELMS] THÔNG BÁO CẤP TÀI KHOẢN " + roleName.toUpperCase());

            // UI mới ĐẸP và ĐÚNG thứ tự dữ liệu [cite: 2026-03-24]
            String htmlContent = String.format(
                    "<div style='font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 30px; border-radius: 12px;'>" +
                            "<div style='text-align: center; margin-bottom: 25px;'>" +
                            "<h2 style='color: #1976d2; margin: 0;'>Chào Mừng Thành Viên Mới!</h2>" +
                            "<p style='color: #757575; font-size: 14px;'>Hệ thống quản lý học tập ELMS</p>" +
                            "</div>" +

                            "<p>Xin chào bạn,</p>" +
                            "<p>Tài khoản <b>%s</b> của bạn trên hệ thống ELMS đã được khởi tạo thành công. Dưới đây là thông tin đăng nhập của bạn:</p>" +

                            "<div style='background-color: #f0f7ff; border: 1px solid #bbdefb; padding: 20px; margin: 25px 0; border-radius: 8px;'>" +
                            "    <div style='margin-bottom: 10px;'>" +
                            "        <span style='color: #1976d2; font-weight: bold; width: 120px; display: inline-block;'>Tên đăng nhập:</span>" +
                            "        <span style='font-family: monospace; font-size: 16px; font-weight: bold; color: #212121;'>%s</span>" +
                            "    </div>" +
                            "    <div>" +
                            "        <span style='color: #1976d2; font-weight: bold; width: 120px; display: inline-block;'>Mật khẩu tạm:</span>" +
                            "        <span style='font-family: monospace; font-size: 16px; font-weight: bold; color: #d32f2f; letter-spacing: 1px;'>%s</span>" +
                            "    </div>" +
                            "</div>" +

                            "<div style='background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin-bottom: 25px;'>" +
                            "<p style='margin: 0; font-size: 13px; color: #2e7d32;'>" +
                            "<b>Hành động bắt buộc:</b> Để bảo mật thông tin, bạn vui lòng đăng nhập và <b>thay đổi mật khẩu ngay lập tức</b> trong lần truy cập đầu tiên." +
                            "</p>" +
                            "</div>" +

                            "<p style='font-size: 13px; color: #616161;'>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ quản trị viên để được hỗ trợ.</p>" +

                            "<hr style='border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;'>" +

                            "<div style='text-align: center; color: #9e9e9e; font-size: 12px;'>" +
                            "<p style='margin: 5px 0;'>Đây là email tự động từ ELMS Lab.</p>" +
                            "<p style='margin: 5px 0;'>&copy; 2026 ELMS Lab. All rights reserved.</p>" +
                            "</div>" +
                            "</div>",
                    roleName, username, rawPassword // ĐÚNG THỨ TỰ [cite: 2026-03-24]
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("[Account Info] Đã gửi mail thành công cho: " + toEmail);
        } catch (Exception e) {
            System.err.println("[Account Info] LỖI GỬI MAIL: " + e.getMessage());
        }
    } 

    @Async
    @Override
    public void sendResetPassword(String toEmail, String username, String newPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("elms.system.lab@gmail.com", "HỆ THỐNG ELMS");
            helper.setTo(toEmail);
            helper.setSubject("[ELMS] XÁC NHẬN CẤP LẠI MẬT KHẨU TÀI KHOẢN");

            String htmlContent = String.format(
                    "<div style='font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 30px; border-radius: 12px;'>" +
                            "<div style='text-align: center; margin-bottom: 25px;'>" +
                            "<h2 style='color: #d32f2f; margin: 0;'>Cấp Lại Mật Khẩu</h2>" +
                            "<p style='color: #757575; font-size: 14px;'>Hệ thống quản lý học tập ELMS</p>" +
                            "</div>" +

                            "<p>Xin chào <b>%s</b>,</p>" +
                            "<p>Chúng tôi nhận được yêu cầu cấp lại mật khẩu cho tài khoản của bạn trên hệ thống ELMS. Mật khẩu của bạn đã được thay đổi thành công thành:</p>" +

                            "<div style='background-color: #fff4f4; border: 2px dashed #d32f2f; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px;'>" +
                            "<span style='display: block; font-size: 12px; color: #d32f2f; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;'>Mật khẩu mới của bạn</span>" +
                            "<span style='font-family: monospace; font-size: 28px; font-weight: bold; color: #212121; letter-spacing: 3px;'>%s</span>" +
                            "</div>" +

                            "<div style='background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin-bottom: 25px;'>" +
                            "<p style='margin: 0; font-size: 13px; color: #e65100;'>" +
                            "<b>Lưu ý bảo mật:</b> Vui lòng đăng nhập và thay đổi mật khẩu này ngay lập tức trong phần <b>Thông tin cá nhân</b> để đảm bảo an toàn cho tài khoản của bạn." +
                            "</p>" +
                            "</div>" +

                            "<p style='font-size: 13px; color: #616161;'>Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ với bộ phận kỹ thuật hoặc Quản trị viên hệ thống để được hỗ trợ kịp thời.</p>" +

                            "<hr style='border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;'>" +

                            "<div style='text-align: center; color: #9e9e9e; font-size: 12px;'>" +
                            "<p style='margin: 5px 0;'>Đây là email tự động, vui lòng không phản hồi email này.</p>" +
                            "<p style='margin: 5px 0;'>&copy; 2026 Hệ thống ELMS Lab. All rights reserved.</p>" +
                            "</div>" +
                            "</div>",
                    username, newPassword
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("[Reset Password] Đã gửi mail thành công cho: " + toEmail);
        } catch (Exception e) {
            System.err.println("[Reset Password] LỖI GỬI MAIL: " + e.getMessage());
        }
    }

    @org.springframework.scheduling.annotation.Async
    @Override
    public void sendGradeReport(String toEmail, Grade grade, String taName, String taPhone, String taEmail, String comment) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");

            boolean isFinal = "FINAL".equalsIgnoreCase(grade.getGradeType());
            String titleText = isFinal ? "BÁO CÁO KẾT QUẢ HỌC TẬP CUỐI KHÓA" : "BÁO CÁO KẾT QUẢ HỌC TẬP THƯỜNG XUYÊN";
            String subjectText = String.format("[ELMS] %s - %s", titleText, grade.getStudentProfile().getUser().getFullName().toUpperCase());

            helper.setFrom("elms.system.lab@gmail.com", "HỆ THỐNG ELMS");
            helper.setTo(toEmail);
            helper.setSubject(subjectText);

            String htmlContent = String.format(
                    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;'>" +
                            "   <h2 style='color: #1a73e8; text-align: center;'>%s</h2>" +
                            "   <p>Kính gửi quý phụ huynh em <b>%s</b>,</p>" +
                            "   <p>Hệ thống ELMS xin gửi tới quý phụ huynh bảng điểm học tập chi tiết của học viên:</p>" +
                            "   <table style='width: 100%%; border-collapse: collapse; margin: 20px 0;'>" +
                            "       <tr style='background-color: #f8f9fa;'><th style='border: 1px solid #ddd; padding: 10px; text-align: left;'>Kỹ năng</th><th style='border: 1px solid #ddd; padding: 10px; text-align: center;'>Điểm số</th></tr>" +
                            "       <tr><td style='border: 1px solid #ddd; padding: 10px;'>Listening (Nghe)</td><td style='border: 1px solid #ddd; padding: 10px; text-align: center;'>%.1f</td></tr>" +
                            "       <tr><td style='border: 1px solid #ddd; padding: 10px;'>Reading (Đọc)</td><td style='border: 1px solid #ddd; padding: 10px; text-align: center;'>%.1f</td></tr>" +
                            "       <tr><td style='border: 1px solid #ddd; padding: 10px;'>Writing (Viết)</td><td style='border: 1px solid #ddd; padding: 10px; text-align: center;'>%.1f</td></tr>" +
                            "       <tr><td style='border: 1px solid #ddd; padding: 10px;'>Speaking (Nói)</td><td style='border: 1px solid #ddd; padding: 10px; text-align: center;'>%.1f</td></tr>" +
                            "       <tr style='font-weight: bold; color: #d93025;'><td style='border: 1px solid #ddd; padding: 10px;'>ĐIỂM TỔNG KẾT</td><td style='border: 1px solid #ddd; padding: 10px; text-align: center;'>%.1f</td></tr>" +
                            "   </table>" +
                            "   <div style='background: #fff3e0; padding: 15px; border-radius: 5px; margin-bottom: 20px;'>" +
                            "       <p style='margin: 0;'><b>Nhận xét của giáo viên:</b> <i>%s</i></p>" +
                            "   </div>" +
                            "   <div style='border-top: 2px solid #1a73e8; padding-top: 15px; font-size: 13px;'>" +
                            "       <p style='margin: 0;'><b>Trợ giảng phụ trách:</b> %s</p>" +
                            "       <p style='margin: 5px 0;'><b>Số điện thoại:</b> %s</p>" +
                            "       <p style='margin: 5px 0;'><b>Email:</b> %s</p>" +
                            "   </div>" +
                            "</div>",
                    titleText,
                    grade.getStudentProfile().getUser().getFullName(),
                    grade.getListening(), grade.getReading(), grade.getWriting(), grade.getSpeaking(),
                    grade.getFinalGrade(), comment,
                    taName, taPhone, taEmail
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}