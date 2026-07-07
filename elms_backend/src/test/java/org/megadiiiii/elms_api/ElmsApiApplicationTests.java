package org.megadiiiii.elms_api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.megadiiiii.elms_api.services.EmailService;

@SpringBootTest
class ElmsApiApplicationTests {

    @Autowired
    private EmailService emailService;

    @Test
    void contextLoads() {
    }

    @Autowired
    private org.megadiiiii.elms_api.repository.ClassRepository classRepository;

    @Autowired
    private org.megadiiiii.elms_api.repository.UserRepository userRepository;

    @Autowired
    private org.megadiiiii.elms_api.services.ScheduleService scheduleService;

    @Test
    @org.springframework.transaction.annotation.Transactional
    void testSchedule() {
        try {
            System.out.println("=== SYSTEM SCHEDULE TEST ===");
            var classes = classRepository.findAll();
            System.out.println("Total classes in database: " + classes.size());
            for (var c : classes) {
                System.out.println("Class: " + c.getClassName()
                        + " | Code: " + c.getClassCode()
                        + " | Teacher: " + (c.getTeacher() != null ? c.getTeacher().getUser().getFullName() : "null")
                        + " | Schedules count: " + (c.getSchedules() != null ? c.getSchedules().size() : 0));
                if (c.getSchedules() != null) {
                    for (var s : c.getSchedules()) {
                        System.out.println("  - Day: " + s.getDayOfWeek() + " | Time: " + s.getStartTime() + " - "
                                + s.getEndTime());
                    }
                }
            }

            var users = userRepository.findAll();
            System.out.println("Total users: " + users.size());
            for (var u : users) {
                System.out.println("User: " + u.getEmail() + " | Role: " + u.getRole().getName());
                try {
                    var events = scheduleService.getCurrentUserSchedule(u.getEmail());
                    System.out.println("  -> Events count: " + events.size());
                    for (var ev : events) {
                        System.out.println("     * Event: " + ev.getTitle() + " | Code: " + ev.getClassCode()
                                + " | Days: " + ev.getDaysOfWeek() + " | Start: " + ev.getStartTime() + " | Recur: "
                                + ev.getStartRecur() + " to " + ev.getEndRecur());
                    }
                } catch (Exception ex) {
                    System.out.println("  -> Error: " + ex.getMessage());
                }
            }
            System.out.println("============================");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
