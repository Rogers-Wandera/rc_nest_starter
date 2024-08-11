import { Inject, Injectable } from '@nestjs/common';
import { Role } from '@entity/entities/core/roles.entity';
import { UserRolesView } from '@entity/entities/coreviews/userroles.view';
import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';
import { addrolestype } from '@toolkit/core-toolkit/types/coretypes';

@Injectable()
export class RoleService extends EntityModel<Role> {
  constructor(@Inject(EntityDataSource) source: EntityDataSource) {
    super(Role, source);
  }

  async createRoles() {
    try {
      return this.repository.save(this.entity);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getUserRoles() {
    try {
      const roles = await this.model.manager.find(UserRolesView, {
        where: { userId: this.entity.user.id },
      });
      return roles;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async RemoveRole(data: addrolestype) {
    try {
      const exists = await this.model.manager.findOne(UserRolesView, {
        where: { userId: data.userId, roleId: data.roleId },
      });
      if (!exists) {
        throw new Error(`No role found`);
      }
      if (exists.rolename === 'User') {
        throw new Error(`User role cannot be deleted`);
      }
      const results = await this.repository.softDataDelete({
        id: exists.id,
        user: { id: exists.userId },
        systemRole: { id: exists.roleId },
      });
      return results.affected === 1;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
