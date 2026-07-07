package org.megadiiiii.elms_api.repository;

import org.megadiiiii.elms_api.constant.RoleType;
import org.megadiiiii.elms_api.dto.response.StaffDetailDTO;
import org.megadiiiii.elms_api.dto.response.StaffSummaryDTO;
import org.megadiiiii.elms_api.models.StaffProfile;
import org.megadiiiii.elms_api.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<User, Long> {
    @Query("SELECT new org.megadiiiii.elms_api.dto.response.StaffSummaryDTO(" +
            "u.id, u.username, sp.staffCode, u.fullName, u.email, r.name, u.status, u.avatar) " +
            "FROM User u " +
            "JOIN u.staffProfile sp " +
            "JOIN u.role r " +
            "WHERE r.name != org.megadiiiii.elms_api.constant.RoleType.STUDENT")
    Page<StaffSummaryDTO> findAllStaffSummaries(Pageable pageable);

    @Query("SELECT new org.megadiiiii.elms_api.dto.response.StaffDetailDTO(" +
            "u.id, u.username, sp.staffCode, u.fullName, r.name, u.status, u.avatar, " +
            "u.gender, u.dob, u.phone, u.email, u.address, u.nationality) " +
            "FROM User u " +
            "LEFT JOIN u.staffProfile sp " +
            "JOIN u.role r " +
            "WHERE u.id = :userId")
    Optional<StaffDetailDTO> findStaffDetailById(@Param("userId") Long userId);

    @Query("SELECT MAX(sp.staffCode) FROM StaffProfile sp WHERE sp.staffCode LIKE CONCAT(:prefix, '%')")
    String findMaxStaffCode(@Param("prefix") String prefix);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role.id = :roleId")
    long countByRoleId(@Param("roleId") Long roleId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name != org.megadiiiii.elms_api.constant.RoleType.STUDENT")
    long countAllStaffs();

    @Query("SELECT new org.megadiiiii.elms_api.dto.response.StaffSummaryDTO(" +
            "u.id, u.username, sp.staffCode, u.fullName, u.email, r.name, u.status, u.avatar) " +
            "FROM User u " +
            "JOIN u.staffProfile sp " +
            "JOIN u.role r " +
            "WHERE r.name != org.megadiiiii.elms_api.constant.RoleType.STUDENT " +
            "AND (:keyword IS NULL OR LOWER(sp.staffCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:roleId IS NULL OR r.id = :roleId)")
    Page<StaffSummaryDTO> searchStaffs(@Param("keyword") String keyword,
                                       @Param("roleId") Long roleId,
                                       Pageable pageable);

    @Query("SELECT sp FROM StaffProfile sp WHERE sp.user.role.name = :roleType")
    List<StaffProfile> findByRoleType(@Param("roleType") RoleType roleType);

    @Query("SELECT sp FROM StaffProfile sp WHERE sp.user.email = :email")
    Optional<StaffProfile> findByUserEmail(@Param("email") String email);

    @Query("SELECT sp FROM StaffProfile sp WHERE sp.user.email = :email")
    Optional<StaffProfile> findStaffProfileByEmail(@Param("email") String email);
}

