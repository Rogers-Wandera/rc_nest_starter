import { UserDataView } from '@core/maincore/entities/coreviews/userdata.view';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { UserGroupSupervisors } from '../../../../entities/core/usergroupsupervisors.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { UserGroup } from '@core/maincore/entities/core/usergroups.entity';

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
      if (this.entity.group.supervisor.length > 0) {
        this.entity = { ...this.entity, isMain: 0 };
      } else {
        this.entity = { ...this.entity, isMain: 1 };
      }
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
  async UpdateIsMainSupervisor() {
    try {
      const supervisors = await this.repository.find({
        where: { group: { id: this.entity.group.id } },
      });
      for (const supervisor of supervisors) {
        if (supervisor.user.id === this.entity.user.id) {
          supervisor.isMain = 1;
        } else {
          supervisor.isMain = 0;
        }
        await this.repository.save(supervisor);
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async viewGroupSupervisors(groupId: number) {
    const query = this.repository
      .createQueryBuilder('usp')
      .select('usp.*')
      .addSelect(
        'ud.userName AS userName, ud.image AS userImage, ud.gender AS gender',
      )
      .addSelect('ug.groupName AS groupName')
      .innerJoin(UserDataView, 'ud', 'ud.id = usp.userId')
      .innerJoin(UserGroup, 'ug', 'ug.id = usp.groupId AND ug.isActive = 1')
      .where('usp.isActive = 1')
      .andWhere('usp.groupId = :groupId', { groupId });
    const supervisors = (await query.getRawMany()) as ({
      userName: string;
      groupName: string;
    } & UserGroupSupervisors)[];
    return supervisors;
  }
}
