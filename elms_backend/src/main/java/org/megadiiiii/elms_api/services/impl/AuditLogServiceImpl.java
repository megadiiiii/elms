package org.megadiiiii.elms_api.services.impl;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.models.AuditLog;
import org.megadiiiii.elms_api.repository.AuditLogRepository;
import org.megadiiiii.elms_api.security.CustomUserDetails;
import org.megadiiiii.elms_api.services.AuditLogService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void log(String actionType, String message) {
        try {
            org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            String performer = "SYSTEM";
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof org.megadiiiii.elms_api.security.CustomUserDetails) {
                    org.megadiiiii.elms_api.security.CustomUserDetails userDetails = (org.megadiiiii.elms_api.security.CustomUserDetails) principal;
                    performer = userDetails.getDisplayName() + " (" + userDetails.getUsername() + ")";
                } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                    org.springframework.security.core.userdetails.UserDetails userDetails = (org.springframework.security.core.userdetails.UserDetails) principal;
                    performer = userDetails.getUsername();
                } else {
                    performer = authentication.getName();
                }
            }

            String fullMessage;
            if ("LOGIN".equalsIgnoreCase(actionType)) {
                fullMessage = message;
            } else {
                fullMessage = performer + " đã " + message;
            }

            AuditLog auditLog = AuditLog.builder()
                    .actionType(actionType)
                    .message(fullMessage)
                    .createdBy(performer)
                    .createdAt(LocalDateTime.now())
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            System.err.println("Ghi log audit bị lỗi: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void log(String actionType, String message, String entityName, Long entityId, Object oldValue, Object newValue) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String performer = "SYSTEM";
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof CustomUserDetails) {
                    CustomUserDetails userDetails = (CustomUserDetails) principal;
                    performer = userDetails.getDisplayName() + " (" + userDetails.getUsername() + ")";
                } else if (principal instanceof UserDetails) {
                    UserDetails userDetails = (UserDetails) principal;
                    performer = userDetails.getUsername();
                } else {
                    performer = authentication.getName();
                }
            }

            String fullMessage = performer + " đã " + message;

            String oldStr = null;
            String newStr = null;

            if (oldValue != null) {
                try {
                    oldStr = objectMapper.writeValueAsString(oldValue);
                } catch (Exception e) {
                    oldStr = oldValue.toString();
                }
            }
            if (newValue != null) {
                try {
                    newStr = objectMapper.writeValueAsString(newValue);
                } catch (Exception e) {
                    newStr = newValue.toString();
                }
            }

            AuditLog auditLog = AuditLog.builder()
                    .actionType(actionType)
                    .message(fullMessage)
                    .createdBy(performer)
                    .entityName(entityName)
                    .entityId(entityId)
                    .oldValue(oldStr)
                    .newValue(newStr)
                    .createdAt(LocalDateTime.now())
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            System.err.println("Ghi log audit bị lỗi: " + e.getMessage());
        }
    }
}
