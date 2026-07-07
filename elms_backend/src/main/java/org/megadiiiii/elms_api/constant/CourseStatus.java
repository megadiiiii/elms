package org.megadiiiii.elms_api.constant;

public enum CourseStatus {
    ACTIVE("Đang giảng dạy"),
    INACTIVE("Ngừng giảng dạy");

    private final String displayName;
    CourseStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static CourseStatus fromDisplayName(String displayName) {
        for (CourseStatus status : CourseStatus.values()) {
            if(status.getDisplayName().equals(displayName)){
                return status;
            }
        }
        return INACTIVE;
    }
}
