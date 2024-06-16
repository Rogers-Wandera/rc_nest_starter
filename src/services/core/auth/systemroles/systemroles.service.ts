import { Inject, Injectable } from '@nestjs/common';
import { PaginationResults } from 'src/app/conn/conntypes';
import { CustomAppError } from 'src/app/context/app.error';
import { DatabaseService } from 'src/db/database.provider';
import { Systemrole } from 'src/entity/core/systemroles.entity';
import { EntityModel } from 'src/model/entity.model';
import { Not } from 'typeorm';

@Injectable()
export class SystemRolesService extends EntityModel<Systemrole> {
  constructor(@Inject('data_source') model: DatabaseService) {
    super(Systemrole, model);
  }
  async ViewSystemroles(): Promise<PaginationResults<Systemrole>> {
    try {
      const results = await this.model.findPaginate<Systemrole>(
        Systemrole,
        this.pagination,
      );
      return results;
    } catch (error) {
      throw new CustomAppError(error.message, 400);
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
      throw new CustomAppError(error.message, 400);
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
      throw new CustomAppError(error.message, 400);
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
      throw new CustomAppError(error.message, 400);
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
      const results = await this.repository.softDataDelete(
        { id: this.entity.id },
        {
          deletedBy: this.entity.deletedBy,
        },
      );
      return results.affected === 1;
    } catch (error) {
      throw new CustomAppError(error.message, 400);
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
