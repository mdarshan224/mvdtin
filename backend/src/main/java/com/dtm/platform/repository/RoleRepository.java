package com.dtm.platform.repository;import com.dtm.platform.entity.Role;import org.springframework.data.jpa.repository.*;
public interface RoleRepository extends JpaRepository<Role,String>,JpaSpecificationExecutor<Role> {  }
