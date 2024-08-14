import { IController } from '@controller/core-controller/controller.interface';
import { UserGroup } from '@entity/entities/core/usergroups.entity';
import { User } from '@entity/entities/core/users.entity';
import { Controller, Delete, Get, Post } from '@nestjs/common';
import { UserGroupMemberService } from '@services/core-services/services/auth/usergroupmembers/usergroupmember.service';
import { ClassValidator } from '@toolkit/core-toolkit/decorators/classvalidator.decorator';
import { Service } from '@toolkit/core-toolkit/decorators/param.decorator';
import { ValidateService } from '@toolkit/core-toolkit/decorators/servicevalidate.decorator';
import { UserGroupMemberDTO } from './usergroupmember.dto';
import { UserGroupMember } from '@entity/entities/core/usergroupmembers.entity';
import { AuthGuard } from '@auth/auth-guards/guards/auth.guard';
import { ROLE } from '@toolkit/core-toolkit/types/enums/enums';
import { Paginate } from '@toolkit/core-toolkit/decorators/pagination.decorator';

@Controller('/core/auth/usergroupmembers')
@AuthGuard(ROLE.ADMIN)
export class UserGroupMemberController extends IController<UserGroupMemberService> {
  constructor(source: UserGroupMemberService) {
    super(source);
  }

  @Get(':groupId')
  @ValidateService([{ entity: UserGroup }])
  @Paginate()
  async ViewGroupMember() {
    try {
      return await this.model.ViewGroupMember();
    } catch (error) {
      throw error;
    }
  }

  @Post(':groupId')
  @ValidateService([{ entity: User, type: 'body' }, { entity: UserGroup }])
  @ClassValidator({ classDTO: UserGroupMemberDTO })
  async Create(
    @Service('userId') user: User,
    @Service('groupId') group: UserGroup,
  ) {
    try {
      this.model.entity.user = user;
      this.model.entity.group = group;
      await this.model.AddGroupMember();
      return { msg: 'Member add successfully' };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ValidateService([{ entity: UserGroupMember }])
  async Delete() {
    try {
      await this.model.RemoveGroupMember();
      return { msg: 'Member removed successfully' };
    } catch (error) {
      throw error;
    }
  }
}
