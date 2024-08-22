import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';
import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { UserGroupMember } from '@entity/entities/core/usergroupmembers.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class UserGroupMemberService extends EntityModel<UserGroupMember> {
  constructor(source: EntityDataSource) {
    super(UserGroupMember, source);
  }

  async ViewGroupMember() {
    this.pagination.conditions = {
      group: { id: this.entity.group.id },
    };
    return this.repository.Paginate(this.pagination);
  }

  async AddGroupMember() {
    try {
      const entity = this.repository.create(this.entity);
      const response = await this.repository.save(entity);
      return response;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UQ_USERGROUPMEMBERS')) {
          throw new BadRequestException(
            `${this.entity.user.firstname} ${this.entity.user.lastname} already exists in the ${this.entity.group.groupName} group.`,
          );
        }
      }
      throw error;
    }
  }

  async RemoveGroupMember() {
    try {
      const response = await this.repository.softDataDelete({
        id: this.entity.id,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}
