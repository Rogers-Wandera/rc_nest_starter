import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Paginate } from '../../../../coretoolkit/decorators/pagination.decorator';
import { Schemas } from '../../../../coretoolkit/decorators/schema.decorator';
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
import {
  linkrolesSchema,
  updatelinkSchema,
} from '../../../../coreservices/services/auth/linkroles/linkroles.schema';
import { AuthGuard } from '../../../../authguards/guards/auth.guard';
import { Roles } from '../../../../authguards/decorators/roles.guard';
import { ROLE } from '../../../../coretoolkit/types/enums/enums';
import { Service } from '../../../../coretoolkit/decorators/param.decorator';

@Controller('/core/auth/linkroles')
@ApiTags('Link Roles (Module Link Roles)')
@AuthGuard(ROLE.ADMIN)
export class LinkRoleController extends IController<LinkRoleService> {
  constructor(model: LinkRoleService) {
    super(model);
  }
  @Post()
  @ApiCreateLinkRole()
  @Schemas({ type: 'body', schemas: [linkrolesSchema] })
  @ValidateService([
    { entity: User, key: 'userId', type: 'body' },
    { entity: ModuleLink, key: 'linkId', type: 'body' },
  ])
  async Create(
    @Res() res: Response,
    @Service('modulelink') modulelink: ModuleLink,
    @Service('user') user: User,
  ) {
    try {
      this.model.entity.User = user;
      this.model.entity.ModuleLink = modulelink;
      const response = await this.model.AddLinkroles();
      const msg = response ? 'Role added successfully' : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiDeleteLinkRole()
  @ValidateService([{ entity: LinkRole, key: 'id' }])
  async Delete(@Res() res: Response) {
    try {
      const response = await this.model.DeleteLinkRole();
      const msg = response
        ? 'Role removed successfully'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }
  @Patch(':id')
  @ApiUpdateLinkRole()
  @ValidateService([{ entity: LinkRole, key: 'id' }])
  @Schemas({ type: 'body', schemas: [updatelinkSchema] })
  async Update(@Res() res: Response) {
    try {
      const response = await this.model.UpdateLinkRole();
      const msg = response
        ? 'Role updated successfully'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg });
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

  @Get('/user/unassigned/:userId')
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
}
