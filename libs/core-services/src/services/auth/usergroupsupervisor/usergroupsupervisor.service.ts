import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';
import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { UserGroupSupervisors } from '@entity/entities/core/usergroupsupervisors.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class UserGroupSupervisorService extends EntityModel<UserGroupSupervisors> {
  constructor(source: EntityDataSource) {
    super(UserGroupSupervisors, source);
  }

  async ViewSupervisors() {
    try {
      this.pagination.conditions = { group: { id: this.entity.group.id } };
      const results = await this.repository.Paginate(this.pagination);
      return results;
    } catch (error) {
      throw error;
    }
  }

  async AddGroupSupervisor() {
    try {
      const response = await this.repository.save(this.entity);
      return response;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UQ_GROUPSUPERVISOR')) {
          throw new BadRequestException(
            `${this.entity.user.firstname} ${this.entity.user.lastname} already exists as a supervisor in the ${this.entity.group.groupName} group.`,
          );
        }
      }
      throw error;
    }
  }
}
