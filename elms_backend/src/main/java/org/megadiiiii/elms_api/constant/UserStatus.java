package org.megadiiiii.elms_api.constant;

public enum UserStatus {
    ACTIVE("Đang hoạt động"),
    INACTIVE("Ngừng hoạt động");

    private final String displayName;
    UserStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static UserStatus fromDisplayName(String displayName) {
        for (UserStatus status : UserStatus.values()) {
            if(status.getDisplayName().equals(displayName)){
                return status;
            }
        }
        return INACTIVE;
    }
}
