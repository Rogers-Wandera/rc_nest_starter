import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { UserGroupSupervisors } from '@entity/entities/core/usergroupsupervisors.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserGroupSupervisorService extends EntityModel<UserGroupSupervisors> {}
