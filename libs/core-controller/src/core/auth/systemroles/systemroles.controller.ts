import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Paginate } from '@toolkit/core-toolkit/decorators/pagination.decorator';
import { Role, Roles } from '@toolkit/core-toolkit/decorators/roles.decorator';
import { Schemas } from '@toolkit/core-toolkit/decorators/schema.decorator';
import { SystemRolesSchema } from '@controller/core-controller/schemas/core/auth/systemroles.schema';
import { IController } from '@controller/core-controller/controller.interface';
import { Permissions } from '@toolkit/core-toolkit/decorators/permissions.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  EMailGuard,
  JwtGuard,
  RolesGuard,
} from '@services/core-services/services/auth/authguards/authguard.guard';
import { SystemRolesService } from '@services/core-services/services/auth/systemroles/systemroles.service';
import {
  AddSystemRolesDoc,
  DeleteSystemRoleDoc,
  GetUnassignedRolesDoc,
  UpdateSystemRolesDoc,
  ViewSystemRolesDoc,
} from '@controller/core-controller/swagger/controllers/core/systemrolescontroller';

@Controller('/core/auth/roles')
@ApiTags('System Roles')
@UseGuards(JwtGuard, EMailGuard, RolesGuard)
@Roles(Role.ADMIN)
@Permissions({ module: 'Configurations', moduleLink: 'Manage Roles' })
export class SystemRolesController extends IController<SystemRolesService> {
  constructor(model: SystemRolesService) {
    super(model);
  }
  @Get('/')
  @ViewSystemRolesDoc()
  @Paginate()
  async ViewSystemRoles(@Res() res: Response) {
    try {
      const data = await this.model.ViewSystemroles();
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @AddSystemRolesDoc()
  @Schemas({ schemas: [SystemRolesSchema], type: 'body' })
  async AddSystemRoles(@Res() res: Response) {
    try {
      const response = await this.model.createSystemRoles();
      const message = response.success
        ? 'System role added successfully'
        : 'Something went wrong';
      res.status(200).json({ msg: message });
    } catch (error) {
      throw error;
    }
  }

  @Patch(':roleId')
  @UpdateSystemRolesDoc()
  @Schemas({ schemas: [SystemRolesSchema], type: 'body' })
  async UpdateSysyemRoles(
    @Res() res: Response,
    @Param('roleId', new ParseIntPipe())
    id: number,
  ) {
    try {
      this.model.entity.id = id;
      const response = await this.model.UpdateSystemroles();
      const message = response
        ? 'System role updated successfully'
        : 'Something went wrong';
      res.status(200).json({ msg: message });
    } catch (error) {
      throw error;
    }
  }

  @Delete(':roleId')
  @DeleteSystemRoleDoc()
  async DeleteSystemRole(
    @Res() res: Response,
    @Param('roleId', new ParseIntPipe())
    id: number,
  ) {
    try {
      this.model.entity.id = id;
      const response = await this.model.DeleteSystemroles();
      const message = response
        ? 'System role removed successfully'
        : 'Something went wrong';
      res.status(200).json({ msg: message });
    } catch (error) {
      throw error;
    }
  }

  @Get('/unassigned/:userId')
  @GetUnassignedRolesDoc()
  async GetUnassignedRoles(
    @Res() res: Response,
    @Param('userId', new ParseUUIDPipe())
    id: string,
  ) {
    try {
      const data = await this.model.ViewNotAssigned(id);
      res.status(200).json(data);
    } catch (error) {
      throw error;
    }
  }
}
