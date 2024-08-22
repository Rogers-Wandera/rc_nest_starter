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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolePermissionService } from '@services/core-services/services/auth/rolepermissions/rolepermission.service';
import { Request, Response } from 'express';
import { ValidateService } from '@toolkit/core-toolkit/decorators/servicevalidate.decorator';
import { IController } from '@controller/core-controller/controller.interface';
import { LinkPermission } from '@entity/entities/core/linkpermissions.entity';
import { LinkRole } from '@entity/entities/core/linkroles.entity';
import { RolePermission } from '@entity/entities/core/rolepermissions.entity';
import { User } from '@entity/entities/core/users.entity';
import {
  ApiCreatePermission,
  ApiDeletePermission,
  ApiViewPermissions,
} from '@controller/core-controller/core/system/linkpermission/linkpermission.swagger';
import { AuthGuard } from '@auth/auth-guards/guards/auth.guard';
import { ROLE } from '@toolkit/core-toolkit/types/enums/enums';
import { Service } from '@toolkit/core-toolkit/decorators/param.decorator';

@Controller('/core/auth/permissions')
@ApiTags('Role Permissions')
@AuthGuard(ROLE.ADMIN)
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
  async Create(
    @Res() res: Response,
    @Req() req: Request,
    @Service('linkrole') linkrole: LinkRole,
    @Service('linkpermission') linkpermission: LinkPermission,
    @Service('user') user: User,
  ) {
    try {
      this.model.entity.createdBy = req.user.id;
      this.model.entity.updatedBy = req.user.id;
      this.model.entity.linkrole = linkrole;
      this.model.entity.user = user;
      this.model.entity.linkpermission = linkpermission;
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
    @Service('user') user: User,
  ) {
    try {
      this.model.entity.user = user;
      const response = await this.model.ViewRolepermissions(linkId);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      throw error;
    }
  }
}
