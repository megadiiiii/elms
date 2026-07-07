package org.megadiiiii.elms_api.repository;

import org.megadiiiii.elms_api.models.StaffProfile;
import org.megadiiiii.elms_api.constant.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StaffProfileRepository extends JpaRepository<StaffProfile, Long> {
    
    @Query("SELECT sp FROM StaffProfile sp WHERE sp.user.role.name = :roleType")
    List<StaffProfile> findByRoleType(@Param("roleType") RoleType roleType);
}
