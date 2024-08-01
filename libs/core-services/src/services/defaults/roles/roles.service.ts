import {
  SYSTEM_ROLES,
  rolestype,
} from '@services/core-services/decorators/roles.decorator';
import { SystemRolesService } from '../../auth/systemroles/systemroles.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemDefaultRoles {
  constructor(private systemRoles: SystemRolesService) {}
  getRoles = async () => {
    try {
      const roles = await this.systemRoles.ViewAll();
      if (roles.length <= 0) {
        return {} as SYSTEM_ROLES;
      }
      const systemroles: SYSTEM_ROLES = {} as SYSTEM_ROLES;
      roles.forEach((role) => {
        const rolename = role.rolename.toUpperCase() as rolestype;
        systemroles[rolename] = role.value;
      });
      return systemroles;
    } catch (error) {
      throw error;
    }
  };
}
