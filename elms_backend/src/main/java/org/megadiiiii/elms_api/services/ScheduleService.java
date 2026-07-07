package org.megadiiiii.elms_api.services;

import org.megadiiiii.elms_api.dto.response.ScheduleEventDTO;
import java.util.List;

public interface ScheduleService {
    List<ScheduleEventDTO> getCurrentUserSchedule(String usernameOrEmail);
}
