package org.megadiiiii.elms_api.controller;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.services.impl.DashboardServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardServiceImpl dashboardService;

    @GetMapping("/data")
    public ResponseEntity<?> getDashboardData() {
        // Tạo một cái Map để bọc thằng stats lại giống hệt cấu trúc React đang gọi
        Map<String, Object> responseData = new HashMap<>();

        // Nhét cục đếm số lượng vào key "stats"
        responseData.put("stats", dashboardService.getAdminStats());

        // Nhét mảng log thực tế từ database vào key "recentLogs"
        responseData.put("recentLogs", dashboardService.getRecentLogs());

        return ResponseEntity.ok(responseData);
    }
}