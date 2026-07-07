package org.megadiiiii.elms_api.constant;

import lombok.Getter;

@Getter
public enum AttendanceStatus {
    PRESENT("Có mặt"),
    ABSENT("Vắng mặt"),
    LATE("Đi muộn"),
    EXCUSED("Vắng có phép");

    private final String displayName;

    AttendanceStatus(String displayName) {
        this.displayName = displayName;
    }
}