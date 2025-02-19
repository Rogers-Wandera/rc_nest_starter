import {
  Body,
  Controller,
  Delete,
  ExecutionContext,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Paginate } from '../../../../coretoolkit/decorators/pagination.decorator';
import { ValidateService } from '../../../../coretoolkit/decorators/servicevalidate.decorator';
import { IController } from '../../../controller.interface';
import { LinkRole } from '../../../../entities/core/linkroles.entity';
import { ModuleLink } from '../../../../entities/core/modulelinks.entity';
import { User } from '../../../../entities/core/users.entity';
import {
  ApiCreateLinkRole,
  ApiDeleteLinkRole,
  ApiGetAssignedRoles,
  ApiGetUnassignedRoles,
  ApiGetUserModules,
  ApiUpdateLinkRole,
} from '../../../core/auth/linkroles/linkroles.swagger';
import { LinkRoleService } from '../../../../coreservices/services/auth/linkroles/linkroles.service';
import { LinkRoleDTO } from '../../../../coreservices/services/auth/linkroles/linkroles.schema';
import { AuthGuard } from '../../../../authguards/guards/auth.guard';
import { Roles } from '../../../../authguards/decorators/roles.guard';
import { ROLE } from '../../../../coretoolkit/types/enums/enums';
import { Service } from '../../../../coretoolkit/decorators/param.decorator';
import { ClassValidator } from '@core/maincore/coretoolkit/decorators/classvalidator.decorator';
import { UserGroup } from '@core/maincore/entities/core/usergroups.entity';

const ServiceToValidate = (ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest();
  const body: LinkRoleDTO = request.body;
  if (body.groupId) {
    return UserGroup;
  }
  return User;
};

const key = (ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest();
  const body: LinkRoleDTO = request.body;
  if (body.groupId) {
    return 'groupId';
  }
  return 'userId';
};

@Controller('/core/auth/linkroles')
@ApiTags('Link Roles (Module Link Roles)')
@AuthGuard(ROLE.ADMIN)
export class LinkRoleController extends IController<LinkRoleService> {
  constructor(model: LinkRoleService) {
    super(model);
  }
  @Post(':linkId')
  @ApiCreateLinkRole()
  @ValidateService([
    { entity: ModuleLink },
    { entity: ServiceToValidate, type: 'body', key: key },
  ])
  @ClassValidator({ classDTO: LinkRoleDTO })
  async Create(
    @Req() req: Request,
    @Service('modulelink') modulelink: ModuleLink,
  ) {
    try {
      const body = req.body as LinkRoleDTO;
      const toassign = body.userId ? 'user' : 'group';
      if (body?.groupId) {
        this.model.entity.group = req.entities['usergroup'] as UserGroup;
      } else {
        this.model.entity.User = req.entities['user'] as User;
      }
      this.model.entity.expireDate = body.expireDate;
      this.model.entity.ModuleLink = modulelink;
      const response = await this.model.AddLinkroles(toassign);
      const msg = response ? 'Role added successfully' : 'Something went wrong';
      return { msg };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiDeleteLinkRole()
  @ValidateService([{ entity: LinkRole, key: 'id' }])
  async Delete() {
    try {
      const response = await this.model.DeleteLinkRole();
      const msg = response
        ? 'Role removed successfully'
        : 'Something went wrong';
      return { msg };
    } catch (error) {
      throw error;
    }
  }
  @Patch(':id')
  @ApiUpdateLinkRole()
  @ValidateService([{ entity: LinkRole, key: 'id' }])
  @ClassValidator({ classDTO: LinkRoleDTO })
  async Update(@Body() body: LinkRoleDTO) {
    try {
      this.model.entity.expireDate = body.expireDate;
      const response = await this.model.UpdateLinkRole();
      const msg = response
        ? 'Role updated successfully'
        : 'Something went wrong';
      return { msg };
    } catch (error) {
      throw error;
    }
  }

  @Get('/user/:userId')
  @Roles(ROLE.USER)
  @ApiGetUserModules()
  @ValidateService([{ entity: User, key: 'userId' }])
  async GetUserModules(@Res() res: Response, @Service('user') user: User) {
    try {
      this.model.entity.User = user;
      const data = await this.model.getUserModules();
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @Get('/user/assigned/:userId')
  @ApiGetAssignedRoles()
  @Paginate()
  @ValidateService([{ entity: User, key: 'userId' }])
  async GetAssignedRoles(@Res() res: Response, @Service('user') user: User) {
    try {
      this.model.entity.User = user;
      const data = await this.model.getAssignedRoles();
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @Get('/user/serverroles/:userId')
  @Paginate()
  @ApiGetUnassignedRoles()
  @ValidateService([{ entity: User, key: 'userId' }])
  async GetUnAssignedRoles(@Res() res: Response, @Service('user') user: User) {
    try {
      this.model.entity.User = user;
      const data = await this.model.getToAssignRoles();
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }
  @Get('/group/serverroles/:groupId')
  @Paginate()
  @ApiGetUnassignedRoles()
  @ValidateService([{ entity: UserGroup }])
  async GetUnAssignedGroupRoles(
    @Res() res: Response,
    @Service('usergroup') group: UserGroup,
  ) {
    try {
      this.model.entity.group = group;
      const data = await this.model.getToAssignRoles('group');
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }
}
