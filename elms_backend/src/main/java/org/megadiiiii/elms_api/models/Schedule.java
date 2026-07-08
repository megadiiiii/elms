package org.megadiiiii.elms_api.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Getter
@Setter
@Table(name = "schedules")
public class Schedule extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Lưu thứ trong tuần: 2, 3, 4, 5, 6, 7, 8 (Chủ nhật)
    private Integer dayOfWeek;

    private LocalTime startTime; // Giờ bắt đầu: 18:00
    private LocalTime endTime;   // Giờ kết thúc: 20:00

    // Thuộc về lớp nào
    @ManyToOne
    @JoinColumn(name = "class_id")
    private ClassEntity classEntity;
}
