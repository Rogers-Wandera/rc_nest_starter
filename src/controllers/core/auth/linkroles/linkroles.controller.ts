import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Paginate } from 'src/app/decorators/pagination.decorator';
import { Role, Roles } from 'src/app/decorators/roles.decorator';
import { Schemas } from 'src/app/decorators/schema.decorator';
import { ValidateService } from 'src/app/decorators/servicevalidate.decorator';
import { IController } from 'src/controllers/controller.interface';
import { LinkRole } from 'src/entity/core/linkroles.entity';
import { ModuleLink } from 'src/entity/core/modulelinks.entity';
import { User } from 'src/entity/core/users.entity';
import {
  EMailGuard,
  JwtGuard,
  RolesGuard,
} from 'src/services/core/auth/authguards/authguard.guard';
import {
  linkrolesSchema,
  updatelinkSchema,
} from 'src/services/core/auth/linkroles/linkroles.schema';
import { LinkRoleService } from 'src/services/core/auth/linkroles/linkroles.service';
import {
  ApiCreateLinkRole,
  ApiDeleteLinkRole,
  ApiGetAssignedRoles,
  ApiGetUnassignedRoles,
  ApiGetUserModules,
  ApiUpdateLinkRole,
} from 'src/swagger/controllers/core/linkrolescontroller';

@Controller('/core/auth/linkroles')
@ApiTags('Link Roles (Module Link Roles)')
@UseGuards(JwtGuard, EMailGuard, RolesGuard)
export class LinkRoleController extends IController<LinkRoleService> {
  constructor(model: LinkRoleService) {
    super(model);
  }
  @Post()
  @ApiCreateLinkRole()
  @Roles(Role.ADMIN)
  @Schemas({ type: 'body', schemas: [linkrolesSchema] })
  @ValidateService([
    { entity: User, key: 'userId', type: 'body' },
    { entity: ModuleLink, key: 'linkId', type: 'body' },
  ])
  async Create(@Res() res: Response, @Req() req: Request) {
    try {
      const modulelink: ModuleLink = req.entities['linkId'];
      const user: User = req.entities['userId'];
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
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
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
  @Roles(Role.USER)
  @ApiGetUserModules()
  @ValidateService([{ entity: User, key: 'userId' }])
  async GetUserModules(@Res() res: Response, @Req() req: Request) {
    try {
      this.model.entity.User = req.entities['userId'];
      const data = await this.model.getUserModules();
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @Get('/user/assigned/:userId')
  @ApiGetAssignedRoles()
  @Paginate()
  @Roles(Role.ADMIN)
  @ValidateService([{ entity: User, key: 'userId' }])
  async GetAssignedRoles(@Res() res: Response, @Req() req: Request) {
    try {
      this.model.entity.User = req.entities['userId'];
      const data = await this.model.getAssignedRoles();
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @Get('/user/unassigned/:userId')
  @ApiGetUnassignedRoles()
  @Roles(Role.ADMIN)
  @ValidateService([{ entity: User, key: 'userId' }])
  async GetUnAssignedRoles(@Res() res: Response, @Req() req: Request) {
    try {
      this.model.entity.User = req.entities['userId'];
      const data = await this.model.getToAssignRoles();
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }
}
