package org.megadiiiii.elms_api.services;

public interface AuditLogService {
    void log(String actionType, String message);
    void log(String actionType, String message, String entityName, Long entityId, Object oldValue, Object newValue);
}
