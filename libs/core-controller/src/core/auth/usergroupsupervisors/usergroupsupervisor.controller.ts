import { IController } from '@controller/core-controller/controller.interface';
import { Controller, Get, Post } from '@nestjs/common';
import { UserGroupSupervisorService } from '@services/core-services/services/auth/usergroupsupervisor/usergroupsupervisor.service';
import { ClassValidator } from '@toolkit/core-toolkit/decorators/classvalidator.decorator';
import { UserGroupSupervisorDTO } from './usergroupsupervisor.dto';
import { ValidateService } from '@toolkit/core-toolkit/decorators/servicevalidate.decorator';
import { User } from '@entity/entities/core/users.entity';
import { UserGroup } from '@entity/entities/core/usergroups.entity';
import { Service } from '@toolkit/core-toolkit/decorators/param.decorator';
import { AuthGuard } from '@auth/auth-guards/guards/auth.guard';
import { ROLE } from '@toolkit/core-toolkit/types/enums/enums';
import { Paginate } from '@toolkit/core-toolkit/decorators/pagination.decorator';
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
}
