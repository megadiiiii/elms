package org.megadiiiii.elms_api.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum RoleType {
    ADMIN(1L, "Quản lý", "AD"),    // ID 1 trong DB là ADMIN
    TEACHER(2L, "Giáo viên", "TC"), // ID 2 trong DB là TEACHER
    TA(3L, "Trợ giảng", "TA"),      // ID 3 trong DB là TA (ĐÂY NÈ!)
    STUDENT(4L, "Học viên", "ST");

    private final Long id;
    private final String displayName;
    private final String prefix;

    public static RoleType fromID(Long id) {
        if (id == null) {
            return null;
        }

        for (RoleType role : RoleType.values()) {
            if (role.id.equals(id)) {
                return role;
            }
        }

        throw new IllegalArgumentException("RoleType not found: " + id);
    }
}
