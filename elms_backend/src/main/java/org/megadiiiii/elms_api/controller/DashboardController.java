package org.megadiiiii.elms_api.controller;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.services.impl.DashboardServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardServiceImpl dashboardService;

    @GetMapping("/data")
    public ResponseEntity<?> getDashboardData() {
        String usernameOrEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> responseData = dashboardService.getDashboardDataForUser(usernameOrEmail);
        return ResponseEntity.ok(responseData);
    }
}