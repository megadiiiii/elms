package org.megadiiiii.elms_api.repository;

import org.megadiiiii.elms_api.dto.response.StudentDetailDTO;
import org.megadiiiii.elms_api.dto.response.StudentSummaryDTO;
import org.megadiiiii.elms_api.models.StudentProfile;
import org.megadiiiii.elms_api.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<User, Long> {

    @Query("SELECT new org.megadiiiii.elms_api.dto.response.StudentSummaryDTO(" +
            "u.id, sp.studentCode, u.fullName, sp.studentNickname, u.status, u.avatar, u.email, u.dob, u.nationality) " +
            "FROM User u " +
            "JOIN u.studentProfile sp " +
            "JOIN u.role r " +
            "WHERE r.name = org.megadiiiii.elms_api.constant.RoleType.STUDENT")
    Page<StudentSummaryDTO> findAllStudentSummaries(Pageable pageable);

    @Query("SELECT new org.megadiiiii.elms_api.dto.response.StudentSummaryDTO(" +
            "u.id, sp.studentCode, u.fullName, sp.studentNickname, u.status, u.avatar, u.email, u.dob, u.nationality) " +
            "FROM User u " +
            "JOIN u.studentProfile sp " +
            "JOIN u.role r " +
            "WHERE r.name = org.megadiiiii.elms_api.constant.RoleType.STUDENT " +
            "AND (:keyword IS NULL OR LOWER(sp.studentCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<StudentSummaryDTO> searchStudents(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT new org.megadiiiii.elms_api.dto.response.StudentDetailDTO(" +
            "u.id, u.username, u.fullName, u.email, u.phone, u.gender, u.dob, u.address, u.nationality, u.avatar, u.status, " +
            "sp.studentCode, sp.studentNickname, sp.parentName, sp.parentPhone, sp.parentEmail) " +
            "FROM User u " +
            "LEFT JOIN u.studentProfile sp " +
            "WHERE u.id = :userId AND u.role.name = org.megadiiiii.elms_api.constant.RoleType.STUDENT")
    Optional<StudentDetailDTO> findStudentDetailById(@Param("userId") Long userId);

    @Query("SELECT MAX(sp.studentCode) FROM StudentProfile sp WHERE sp.studentCode LIKE CONCAT(:prefix, '%')")
    String findMaxStudentCode(@Param("prefix") String prefix);

    @Query("SELECT sp FROM StudentProfile sp WHERE sp.user.email = :email")
    Optional<StudentProfile> findStudentProfileByEmail(@Param("email") String email);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name = org.megadiiiii.elms_api.constant.RoleType.STUDENT")
    long countAllStudents();

    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name = org.megadiiiii.elms_api.constant.RoleType.STUDENT AND u.status = org.megadiiiii.elms_api.constant.UserStatus.ACTIVE")
    long countActiveStudents();

    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name = org.megadiiiii.elms_api.constant.RoleType.STUDENT AND u.status = org.megadiiiii.elms_api.constant.UserStatus.INACTIVE")
    long countInactiveStudents();

    @Query("SELECT new org.megadiiiii.elms_api.dto.response.StudentSummaryDTO(" +
            "u.id, sp.studentCode, u.fullName, sp.studentNickname, u.status, u.avatar, u.email, u.dob, u.nationality) " +
            "FROM User u " +
            "JOIN u.studentProfile sp " +
            "JOIN u.role r " +
            "WHERE r.name = org.megadiiiii.elms_api.constant.RoleType.STUDENT " +
            "AND u.status = org.megadiiiii.elms_api.constant.UserStatus.ACTIVE " +
            "AND (:keyword IS NULL OR LOWER(sp.studentCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    java.util.List<StudentSummaryDTO> searchActiveStudentsForAutocomplete(@Param("keyword") String keyword, Pageable pageable);
}
