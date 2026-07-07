package org.megadiiiii.elms_api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleRequestDTO {
    private Integer dayOfWeek; // 2, 3, 4, 5, 6, 7, 8 (Chủ nhật)
    private String startTime;  // "18:00"
    private String endTime;    // "20:00"
}
