package org.megadiiiii.elms_api.repository;

import org.megadiiiii.elms_api.constant.RoleType;
import org.megadiiiii.elms_api.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleType name);

    @Query("SELECT r FROM Role r WHERE r.name != org.megadiiiii.elms_api.constant.RoleType.STUDENT")
    List<Role> findStaffRoles();
}