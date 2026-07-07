package org.megadiiiii.elms_api.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ClassStatus {
    UPCOMING("Sắp khai giảng"),
    ONGOING("Đang diễn ra"),
    FINISHED("Đã kết thúc"),
    CANCELLED("Đã hủy");

    private final String displayName;
}