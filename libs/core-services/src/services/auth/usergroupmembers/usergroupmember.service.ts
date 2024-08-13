import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';
import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { UserGroupMember } from '@entity/entities/core/usergroupmembers.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserGroupMemberService extends EntityModel<UserGroupMember> {
  constructor(source: EntityDataSource) {
    super(UserGroupMember, source);
  }
}
