package org.megadiiiii.elms_api.repository;

import org.megadiiiii.elms_api.constant.RoleType;
import org.megadiiiii.elms_api.dto.response.UserDetailDTO;
import org.megadiiiii.elms_api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameOrEmail(String username, String email);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    @Query("SELECT new org.megadiiiii.elms_api.dto.response.UserDetailDTO(" +
            "u.id, u.username, u.fullName, r.name, u.status, u.avatar, u.gender, u.dob, " +
            "COALESCE(sp.staffCode, st.studentCode), " +
            "u.phone, u.email, u.address, u.nationality) " +
            "FROM User u " +
            "JOIN u.role r " +
            "LEFT JOIN u.staffProfile sp " +
            "LEFT JOIN u.studentProfile st " +
            "WHERE u.id = :userId")
    Optional<UserDetailDTO> findUserDetailById(@Param("userId") Long userId);

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.username = :username OR u.email = :username")
    Optional<User> findByUsernameWithRole(@Param("username") String username);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name = :roleName")
    long countByRoleName(@Param("roleName") RoleType roleName);
}