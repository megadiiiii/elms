package org.megadiiiii.elms_api.controller;

import lombok.RequiredArgsConstructor;
import org.megadiiiii.elms_api.dto.response.ScheduleEventDTO;
import org.megadiiiii.elms_api.services.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<List<ScheduleEventDTO>> getCurrentUserSchedule() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ScheduleEventDTO> schedule = scheduleService.getCurrentUserSchedule(email);
        return ResponseEntity.ok(schedule);
    }
}
