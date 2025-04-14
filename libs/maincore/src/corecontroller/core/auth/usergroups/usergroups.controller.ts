import { AuthGuard } from '../../../../authguards/guards/auth.guard';
import { IController } from '../../../controller.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserGroupService } from '../../../../coreservices/services/auth/usergroups/usergroup.service';
import { ROLE } from '../../../../coretoolkit/types/enums/enums';
import { UserGroupDTO } from './usergroup.dto';
import { ClassValidator } from '../../../../coretoolkit/decorators/classvalidator.decorator';
import { Paginate } from '../../../../coretoolkit/decorators/pagination.decorator';
import { Permissions } from '../../../../coretoolkit/decorators/permissions.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateUserGroup,
  ApiRemoveUserGroup,
  ApiUpdateUserGroup,
  ApiViewUserGroups,
} from './usergroup.swagger';
import { ValidateService } from '@core/maincore/coretoolkit/decorators/servicevalidate.decorator';
import { UserGroup } from '@core/maincore/entities/core/usergroups.entity';

@Controller('/core/auth/usergroups')
@Permissions({ module: 'User Management', moduleLink: 'User Groups' })
@AuthGuard(ROLE.ADMIN)
@ApiTags('User Groups')

export class UserGroupController extends IController<UserGroupService> {
  constructor(model: UserGroupService) {
    super(model);
  }

  @Get()
  @ApiViewUserGroups()
  @Paginate()
  async View() {
    try {
      return await this.model.ViewGroups();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ValidateService({ entity: UserGroup })
  async ViewSingle() {
    try {
      return await this.model.ViewSingleGroup();
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiCreateUserGroup()
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
  @ApiUpdateUserGroup()
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
  @ApiRemoveUserGroup()
  async Delete(@Param('id') id: number) {
    try {
      this.model.entity.id = id;
      await this.model.DeleteGroup();
      return { msg: 'Group deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/status/:id')
  @ValidateService({ entity: UserGroup })
  async updateStatus() {
    try {
      const text =
        this.model.entity.status === 'active' ? 'disabled' : 'enabled';
      await this.model.updateStatus();
      return { msg: `Group ${text} successfully` };
    } catch (error) {
      throw error;
    }
  }
}
