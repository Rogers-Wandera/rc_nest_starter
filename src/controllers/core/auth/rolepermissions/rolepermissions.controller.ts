import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Role, Roles } from 'src/app/decorators/roles.decorator';
import { ValidateService } from 'src/app/decorators/servicevalidate.decorator';
import { IController } from 'src/controllers/controller.interface';
import { LinkPermission } from 'src/entity/core/linkpermissions.entity';
import { LinkRole } from 'src/entity/core/linkroles.entity';
import { RolePermission } from 'src/entity/core/rolepermissions.entity';
import { User } from 'src/entity/core/users.entity';
import {
  EMailGuard,
  JwtGuard,
  RolesGuard,
} from 'src/services/core/auth/authguards/authguard.guard';
import { RolePermissionService } from 'src/services/core/auth/rolepermissions/rolepermission.service';
import {
  ApiCreatePermission,
  ApiDeletePermission,
  ApiViewPermissions,
} from 'src/swagger/controllers/core/rolepermissions';

@Controller('/core/auth/permissions')
@ApiTags('Role Permissions')
@UseGuards(JwtGuard, EMailGuard, RolesGuard)
@Roles(Role.ADMIN)
export class RolePermissionController extends IController<RolePermissionService> {
  constructor(model: RolePermissionService) {
    super(model);
  }
  @Post(':roleId/:permissionId/:userId')
  @ApiCreatePermission()
  @ValidateService([
    { entity: User, key: 'userId' },
    { entity: LinkRole, key: 'roleId' },
    { entity: LinkPermission, key: 'permissionId' },
  ])
  async Create(@Res() res: Response, @Req() req: Request) {
    try {
      this.model.entity.createdBy = req.user.id;
      this.model.entity.updatedBy = req.user.id;
      this.model.entity.linkrole = req.entities['roleId'];
      this.model.entity.user = req.entities['userId'];
      this.model.entity.linkpermission = req.entities['permissionId'];
      const response = await this.model.AddPermission();
      const msg = response
        ? 'Permission added successsfully'
        : 'Something went wrong';
      res.status(200).json({ msg });
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiDeletePermission()
  @ValidateService([{ entity: RolePermission }])
  async Delete(@Res() res: Response) {
    try {
      console.log(this.model.entity);
      const response = await this.model.DeletePermission();
      const msg = response
        ? 'Permission deleted successfully'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }

  @Get(':userId/:linkId')
  @ApiViewPermissions()
  @ValidateService([{ entity: User }])
  async View(
    @Res() res: Response,
    @Param('linkId', new ParseIntPipe()) linkId: number,
    @Req() req: Request,
  ) {
    try {
      this.model.entity.user = req.entities['userId'];
      const response = await this.model.ViewRolepermissions(linkId);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      throw error;
    }
  }
}
