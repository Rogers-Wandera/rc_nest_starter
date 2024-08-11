import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionSchema } from '@services/core-services/services/system/linkpermissions/linkpermission.schema';
import { LinkPermissionService } from '@services/core-services/services/system/linkpermissions/linkpermissions.service';
import { Request, Response } from 'express';
import { Paginate } from '@toolkit/core-toolkit/decorators/pagination.decorator';
import { Schemas } from '@toolkit/core-toolkit/decorators/schema.decorator';
import { ValidateService } from '@toolkit/core-toolkit/decorators/servicevalidate.decorator';
import { IController } from '@controller/core-controller/controller.interface';
import { LinkPermission } from '@entity/entities/core/linkpermissions.entity';
import { ModuleLink } from '@entity/entities/core/modulelinks.entity';
import {
  ApiCreatePermission,
  ApiDeletePermission,
  ApiUpdatePermission,
  ApiViewPermissions,
  ApiViewSelectPermissions,
} from '@controller/core-controller/swagger/controllers/core/linkpermission';
import { AuthGuard } from '@auth/auth-guards/guards/auth.guard';
import { ROLE } from '@toolkit/core-toolkit/types/enums/enums';

@Controller('/core/system/linkpermission')
@ApiTags('Link (Module Links) Permissions')
@AuthGuard(ROLE.ADMIN)
export class LinkPermissionController extends IController<LinkPermissionService> {
  constructor(model: LinkPermissionService) {
    super(model);
  }
  @Post(':moduleLinkId')
  @ApiCreatePermission()
  @Schemas({ schemas: [PermissionSchema] })
  @ValidateService([{ entity: ModuleLink, key: 'moduleLinkId' }])
  async Create(@Res() res: Response, @Req() req: Request) {
    const modulelink: ModuleLink = req.entities['moduleLinkId'];
    this.model.entity.ModuleLink = modulelink;
    const response = await this.model.AddPermission();
    const msg = response
      ? 'Permission added successfully'
      : 'Something went wrong';
    return res.status(HttpStatus.OK).json({ msg });
  }
  @Patch(':linkId')
  @ApiUpdatePermission()
  @ValidateService([{ entity: LinkPermission, key: 'linkId' }])
  @Schemas({ schemas: [PermissionSchema] })
  async Update(@Res() res: Response) {
    try {
      const response = await this.model.UpdatePermission();
      const msg = response
        ? 'Permission updated successfully'
        : 'Something went wrong';
      return res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }
  @Paginate()
  @Get(':moduleLinkId')
  @ApiViewPermissions()
  async View(
    @Res() res: Response,
    @Param('moduleLinkId', new ParseIntPipe()) id: number,
  ) {
    try {
      const response = await this.model.ViewPermissions(id);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      throw error;
    }
  }
  @Get('/view/:moduleLinkId')
  @ApiViewSelectPermissions()
  async ViewSelects(
    @Res() res: Response,
    @Param('moduleLinkId', new ParseIntPipe()) id: number,
  ) {
    try {
      const data = await this.model.ViewSelectPermissions(id);
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }
  @Delete(':linkId')
  @ApiDeletePermission()
  @ValidateService([{ entity: LinkPermission, key: 'linkId' }])
  async Delete(@Res() res: Response) {
    try {
      const response = await this.model.DeletePermsission();
      const msg = response
        ? 'Permission deleted successfully'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }
}
