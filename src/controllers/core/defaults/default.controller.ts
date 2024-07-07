import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Permissions } from 'src/app/decorators/permissions.decorator';
import { Role, Roles } from 'src/app/decorators/roles.decorator';
import {
  EMailGuard,
  JwtGuard,
  RolesGuard,
} from 'src/services/core/auth/authguards/authguard.guard';
import { SystemPermissionsService } from 'src/services/core/defaults/permissions/permissions.service';
import {
  AddPermissionsDoc,
  GetPermissionsDoc,
} from 'src/swagger/controllers/core/defaultcontroller';

@Controller('/core/defaults')
@ApiTags('Core Configurations')
@UseGuards(JwtGuard, EMailGuard, RolesGuard)
@Roles(Role.PROGRAMMER)
export class DefaultController {
  constructor(private readonly permission: SystemPermissionsService) {}
  @Post('permissions')
  @AddPermissionsDoc()
  @Permissions({
    module: 'Configurations',
    moduleLink: 'Permissions',
  })
  async AddPermissions(@Res() res: Response, @Req() req: Request) {
    const data = await this.permission.AddPermissions(req.user.id);
    res.status(HttpStatus.OK).json(data);
  }
  @Get('permissions')
  @GetPermissionsDoc()
  @Permissions({
    module: 'Configurations',
    moduleLink: 'Permissions',
  })
  async GetPermissions(@Res() res: Response) {
    res.status(HttpStatus.OK).json(this.permission.GetPermissions());
  }
}
