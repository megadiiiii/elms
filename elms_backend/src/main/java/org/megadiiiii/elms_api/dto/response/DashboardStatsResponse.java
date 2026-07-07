package org.megadiiiii.elms_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalStudents;
    private long activeClasses;
    private long totalCourses;
    private long totalTeachers;
    private long totalTAs;
}