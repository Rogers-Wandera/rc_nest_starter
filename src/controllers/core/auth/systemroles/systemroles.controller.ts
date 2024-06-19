import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { SystemRolesService } from '../../../../services/core/auth/systemroles/systemroles.service';
import { Response } from 'express';
import { Paginate } from 'src/app/decorators/pagination.decorator';
import {
  EMailGuard,
  JwtGuard,
  RolesGuard,
} from 'src/services/core/auth/authguards/authguard.guard';
import { Role, Roles } from 'src/app/decorators/roles.decorator';

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
}
