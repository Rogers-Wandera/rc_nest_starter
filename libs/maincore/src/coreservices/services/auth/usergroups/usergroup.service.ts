import { EntityDataSource } from '../../../../databridge/model/enity.data.model';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { UserGroupDTO } from '../../../../corecontroller/core/auth/usergroups/usergroup.dto';
import { UserGroup } from '../../../../entities/core/usergroups.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { UserGroupSupervisorService } from '../usergroupsupervisor/usergroupsupervisor.service';
import { UserGroupMemberService } from '../usergroupmembers/usergroupmember.service';
import { UserGroupStatus } from '@core/maincore/coretoolkit/types/enums/enums';

@Injectable()
export class UserGroupService extends EntityModel<UserGroup> {
  constructor(
    source: EntityDataSource,
    private groupsupervisors: UserGroupSupervisorService,
    private groupmembers: UserGroupMemberService,
  ) {
    super(UserGroup, source);
  }

  async ViewGroups() {
    const results = await this.repository.Paginate(this.pagination);
    if (results.docs.length > 0) {
      for (const group of results.docs) {
        const supervsiors = await this.groupsupervisors.viewGroupSupervisors(
          group.id,
        );
        const members = await this.groupmembers.ViewUserGroupMembers(group.id);
        group.supervisor = supervsiors;
        group.members = members;
      }
    }
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

  async updateStatus() {
    if (this.entity.status === UserGroupStatus.ACTIVE) {
      this.entity.status = UserGroupStatus.INACTIVE;
    } else {
      this.entity.status = UserGroupStatus.ACTIVE;
    }
    await this.repository.save(this.entity);
    return true;
  }
}
