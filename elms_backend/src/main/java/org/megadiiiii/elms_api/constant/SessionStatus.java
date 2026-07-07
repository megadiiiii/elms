package org.megadiiiii.elms_api.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SessionStatus {
    SCHEDULED("Đã lên lịch"), // Buổi học nằm trong kế hoạch
    COMPLETED("Đã hoàn thành"), // Giáo viên đã dạy xong và điểm danh
    CANCELLED("Đã hủy"), // Nghỉ lễ hoặc lý do đột xuất
    POSTPONED("Tạm hoãn"); // Dời sang ngày khác

    private final String displayName;
}