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
import { SystemRolesService } from '../../../../services/core/auth/systemroles/systemroles.service';
import { Response } from 'express';
import { Paginate } from 'src/app/decorators/pagination.decorator';
import {
  EMailGuard,
  JwtGuard,
  RolesGuard,
} from 'src/services/core/auth/authguards/authguard.guard';
import { Role, Roles } from 'src/app/decorators/roles.decorator';
import { Schemas } from 'src/app/decorators/schema.decorator';
import { SystemRolesSchema } from 'src/schemas/core/auth/systemroles.schema';

@Controller('/core/auth/roles')
@UseGuards(JwtGuard, EMailGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SystemRolesController {
  constructor(private readonly model: SystemRolesService) {}
  @Get('/')
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
