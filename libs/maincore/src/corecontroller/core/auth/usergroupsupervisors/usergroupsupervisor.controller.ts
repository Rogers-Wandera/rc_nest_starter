import { IController } from '../../../controller.interface';
import { Controller, Get, Patch, Post } from '@nestjs/common';
import { UserGroupSupervisorService } from '../../../../coreservices/services/auth/usergroupsupervisor/usergroupsupervisor.service';
import { ClassValidator } from '../../../../coretoolkit/decorators/classvalidator.decorator';
import { UserGroupSupervisorDTO } from './usergroupsupervisor.dto';
import { ValidateService } from '../../../../coretoolkit/decorators/servicevalidate.decorator';
import { User } from '../../../../entities/core/users.entity';
import { UserGroup } from '../../../../entities/core/usergroups.entity';
import { Service } from '../../../../coretoolkit/decorators/param.decorator';
import { AuthGuard } from '../../../../authguards/guards/auth.guard';
import { ROLE } from '../../../../coretoolkit/types/enums/enums';
import { Paginate } from '../../../../coretoolkit/decorators/pagination.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('/core/auth/groupsupervisors')
@AuthGuard(ROLE.ADMIN)
@ApiTags('User Group Supervisors')
export class UsergroupsupervisorController extends IController<UserGroupSupervisorService> {
  constructor(model: UserGroupSupervisorService) {
    super(model);
  }

  @Get(':groupId')
  @Paginate()
  @ValidateService([{ entity: UserGroup }])
  View(@Service() group: UserGroup) {
    this.model.entity.group = group;
    return this.model.ViewSupervisors();
  }

  @Post()
  @ClassValidator({ classDTO: UserGroupSupervisorDTO })
  @ValidateService([
    { entity: User, type: 'body' },
    { entity: UserGroup, type: 'body', key: 'groupId' },
  ])
  async Create(
    @Service('user') user: User,
    @Service('usergroup') group: UserGroup,
  ) {
    try {
      this.model.entity.user = user;
      this.model.entity.group = group;
      await this.model.AddGroupSupervisor();
      return { msg: 'User added as supervisor successfully' };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/main')
  @ClassValidator({ classDTO: UserGroupSupervisorDTO })
  @ValidateService([
    { entity: User, type: 'body' },
    { entity: UserGroup, type: 'body', key: 'groupId' },
  ])
  async UpdateIsMain(
    @Service('user') user: User,
    @Service('usergroup') group: UserGroup,
  ) {
    try {
      this.model.entity.group = group;
      this.model.entity.user = user;
      await this.model.UpdateIsMainSupervisor();
      return {
        msg:
          this.model.entity.user.firstname +
          ` has been set as ${this.model.entity.group.groupName} supervisor`,
      };
    } catch (error) {
      throw error;
    }
  }
}
