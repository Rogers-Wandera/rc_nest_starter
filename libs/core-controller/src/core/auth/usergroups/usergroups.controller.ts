import { AuthGuard } from '@auth/auth-guards/guards/auth.guard';
import { IController } from '@controller/core-controller/controller.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserGroupService } from '@services/core-services/services/auth/usergroups/usergroup.service';
import { ROLE } from '@toolkit/core-toolkit/types/enums/enums';
import { UserGroupDTO } from './usergroup.dto';
import { ClassValidator } from '@toolkit/core-toolkit/decorators/classvalidator.decorator';
import { Paginate } from '@toolkit/core-toolkit/decorators/pagination.decorator';

@Controller('/core/auth/usergroups')
@AuthGuard(ROLE.ADMIN)
export class UserGroupController extends IController<UserGroupService> {
  constructor(model: UserGroupService) {
    super(model);
  }

  @Get()
  @Paginate()
  async View() {
    try {
      return await this.model.ViewGroups();
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ClassValidator({ classDTO: UserGroupDTO })
  async Create(@Body() body: UserGroupDTO) {
    try {
      await this.model.AddGroup(body);
      return { msg: 'Group created successfully' };
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @ClassValidator({ classDTO: UserGroupDTO })
  async Update(@Body() body: UserGroupDTO, @Param('id') id: number) {
    try {
      this.model.entity.id = id;
      await this.model.UpdateGroup(body);
      return { msg: 'Group updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async Delete(@Param('id') id: number) {
    try {
      this.model.entity.id = id;
      await this.model.DeleteGroup();
      return { msg: 'Group deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}
