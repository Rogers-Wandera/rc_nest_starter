import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { UserGroup } from '@entity/entities/core/usergroups.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserGroupService extends EntityModel<UserGroup> {}
