import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolePermissionService } from '../../../../coreservices/services/auth/rolepermissions/rolepermission.service';
import { Response } from 'express';
import { ValidateService } from '../../../../coretoolkit/decorators/servicevalidate.decorator';
import { IController } from '../../../controller.interface';
import { LinkPermission } from '../../../../entities/core/linkpermissions.entity';
import { LinkRole } from '../../../../entities/core/linkroles.entity';
import { RolePermission } from '../../../../entities/core/rolepermissions.entity';
import { User } from '../../../../entities/core/users.entity';
import {
  ApiCreatePermission,
  ApiDeletePermission,
  ApiViewPermissions,
} from '../../../core/system/linkpermission/linkpermission.swagger';
import { AuthGuard } from '../../../../authguards/guards/auth.guard';
import { ROLE } from '../../../../coretoolkit/types/enums/enums';
import { Service } from '../../../../coretoolkit/decorators/param.decorator';

@Controller('/core/auth/permissions')
@ApiTags('Role Permissions')
@AuthGuard(ROLE.ADMIN)
export class RolePermissionController extends IController<RolePermissionService> {
  constructor(model: RolePermissionService) {
    super(model);
  }
  @Post(':roleId/:permissionId')
  @ApiCreatePermission()
  @ValidateService([
    { entity: LinkRole, key: 'roleId' },
    { entity: LinkPermission, key: 'permissionId' },
  ])
  async Create(
    @Service('linkrole') linkrole: LinkRole,
    @Service('linkpermission') linkpermission: LinkPermission,
  ) {
    try {
      this.model.entity.linkrole = linkrole;
      this.model.entity.linkpermission = linkpermission;
      const response = await this.model.AddPermission();
      const msg = response
        ? 'Permission added successsfully'
        : 'Something went wrong';
      return { msg };
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
    @Service('user') user: User,
  ) {
    try {
      const response = await this.model.ViewRolepermissions(linkId, user.id);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      throw error;
    }
  }
}
