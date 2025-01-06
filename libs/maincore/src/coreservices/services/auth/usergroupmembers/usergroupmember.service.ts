import { UserDataView } from '@core/maincore/entities/coreviews/userdata.view';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { UserGroupMember } from '../../../../entities/core/usergroupmembers.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { UserGroup } from '@core/maincore/entities/core/usergroups.entity';

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

  async ViewUserGroupMembers(groupId: number) {
    const query = this.repository
      .createQueryBuilder('ugm')
      .select('ugm.*')
      .addSelect(
        'ud.userName AS userName, ud.image AS userImage,ud.gender AS gender',
      )
      .addSelect('ug.groupName AS groupName')
      .innerJoin(UserDataView, 'ud', 'ud.id = ugm.userId')
      .innerJoin(UserGroup, 'ug', 'ug.id = ugm.groupId AND ug.isActive = 1')
      .where('ugm.isActive = 1')
      .andWhere('ugm.groupId = :groupId', { groupId });
    const members = (await query.getRawMany()) as ({
      userName: string;
      groupName: string;
    } & UserGroupMember)[];
    return members;
  }
}
