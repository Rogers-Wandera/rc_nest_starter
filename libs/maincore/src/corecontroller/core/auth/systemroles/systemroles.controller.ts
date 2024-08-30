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
} from '@nestjs/common';
import { Response } from 'express';
import { Paginate } from '../../../../coretoolkit/decorators/pagination.decorator';
import { Schemas } from '../../../../coretoolkit/decorators/schema.decorator';
import { SystemRolesSchema } from '../../../schemas/core/auth/systemroles.schema';
import { IController } from '../../../controller.interface';
import { Permissions } from '../../../../coretoolkit/decorators/permissions.decorator';
import { ApiTags } from '@nestjs/swagger';
import { SystemRolesService } from '../../../../coreservices/services/auth/systemroles/systemroles.service';
import {
  AddSystemRolesDoc,
  DeleteSystemRoleDoc,
  GetUnassignedRolesDoc,
  UpdateSystemRolesDoc,
  ViewSystemRolesDoc,
} from '../../../../corecontroller/core/auth/systemroles/systemroles.swagger';
import { AuthGuard } from '../../../../authguards/guards/auth.guard';
import { ROLE } from '../../../../coretoolkit/types/enums/enums';
import { Only } from '@core/maincore/authguards/decorators/only.guard';

@Controller('/core/auth/roles')
@ApiTags('System Roles')
@Permissions({ module: 'Configurations', moduleLink: 'Manage Roles' })
@AuthGuard(ROLE.ADMIN)
export class SystemRolesController extends IController<SystemRolesService> {
  constructor(model: SystemRolesService) {
    super(model);
  }
  @Get('/')
  @Only(ROLE.PROGRAMMER, ROLE.ADMIN)
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
  @Only(ROLE.PROGRAMMER)
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
  @Only(ROLE.PROGRAMMER)
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
  @Only(ROLE.PROGRAMMER)
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
