import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Systemrole } from '@entity/entities/core/systemroles.entity';
import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';
import { Not } from 'typeorm';
import { PaginationResults } from '@toolkit/core-toolkit/types/coretypes';

@Injectable()
export class SystemRolesService extends EntityModel<Systemrole> {
  constructor(@Inject(EntityDataSource) source: EntityDataSource) {
    super(Systemrole, source);
  }
  async ViewSystemroles(): Promise<PaginationResults<Systemrole>> {
    try {
      const results = await this.repository.Paginate(this.pagination);
      return results;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  // view one
  async ViewSingleSystemroles(): Promise<Systemrole> {
    try {
      const results = await this.repository.findOneBy({
        id: this.entity.id,
      });
      return results;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  //   add function
  async createSystemRoles() {
    try {
      const exists = await this.repository.findOneBy({
        rolename: this.entity.rolename,
        isActive: 1,
      });
      if (exists) {
        throw new Error('System role already exists');
      }
      const results: Systemrole = await this.repository.save(this.entity);
      if (results.id) {
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  //   update function
  async UpdateSystemroles() {
    try {
      const exists = await this.repository.findOneBy({
        rolename: this.entity.rolename,
        isActive: 1,
        id: Not(this.entity.id),
      });
      if (exists) {
        throw new Error('System role already exists');
      }
      const results = await this.repository.FindOneAndUpdate(
        { id: this.entity.id },
        {
          rolename: this.entity.rolename,
          value: this.entity.value,
          released: this.entity.released,
          description: this.entity.description,
          updatedBy: this.entity.updatedBy,
        },
      );
      return results;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  //   delete function
  async DeleteSystemroles() {
    try {
      const exists = await this.repository.findOneBy({ id: this.entity.id });
      if (!exists) {
        throw new Error(`No system role found`);
      }
      if (exists.rolename === 'User') {
        throw new Error(`User role cannot be deleted`);
      }
      exists.deletedBy = this.entity.deletedBy;
      const results = await this.repository.softDataDelete({
        id: this.entity.id,
      });
      return results.affected === 1;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async ViewNotAssigned(userId: string): Promise<Systemrole[]> {
    try {
      const sql = `SELECT *FROM systemroles sr WHERE sr.isActive = 1 AND sr.id NOT IN (
      SELECT ur.roleId FROM user_roles ur WHERE ur.userId = ?);`;
      const results = await this.model.executeQuery<Systemrole>(sql, [userId]);
      return results;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
