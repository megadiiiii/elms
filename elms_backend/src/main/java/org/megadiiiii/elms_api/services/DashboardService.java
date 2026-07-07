package org.megadiiiii.elms_api.services;

import org.megadiiiii.elms_api.dto.response.DashboardStatsResponse;

/**
 * Interface định nghĩa các nghiệp vụ liên quan đến trang chủ
 */
public interface DashboardService {

    DashboardStatsResponse getAdminStats();
}