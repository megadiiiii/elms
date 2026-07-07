package org.megadiiiii.elms_api.repository;

import org.megadiiiii.elms_api.models.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findAllByClassEntityIdOrderBySessionDateAsc(Long classId);
}