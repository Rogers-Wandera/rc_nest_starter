import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';
import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { UserGroupDTO } from '@controller/core-controller/core/auth/usergroups/usergroup.dto';
import { UserGroup } from '@entity/entities/core/usergroups.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class UserGroupService extends EntityModel<UserGroup> {
  constructor(source: EntityDataSource) {
    super(UserGroup, source);
  }

  async ViewGroups() {
    const results = await this.repository.Paginate(this.pagination);
    return results;
  }

  async AddGroup(body: UserGroupDTO) {
    try {
      this.entity.groupName = body.groupName;
      this.entity.description = body.description;
      const response = await this.repository.save(this.entity);
      return response;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UQ_GROUPNAME')) {
          throw new BadRequestException(
            `The ${body.groupName} group already exists`,
          );
        }
      }
      throw error;
    }
  }

  async DeleteGroup() {
    const response = await this.repository.softDataDelete({
      id: this.entity.id,
    });
    return response.affected === 1;
  }

  async UpdateGroup(body: UserGroupDTO) {
    try {
      const response = await this.repository.FindOneAndUpdate(
        { id: this.entity.id },
        { groupName: body.groupName, description: body.description },
      );
      return response;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('usergroups.UQ_GROUPNAME')) {
          throw new BadRequestException(
            `The ${body.groupName} group already exists`,
          );
        }
      }
      throw error;
    }
  }
}
