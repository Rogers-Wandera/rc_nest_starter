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
import { PermissionSchema } from '../../../../coreservices/services/system/linkpermissions/linkpermission.schema';
import { LinkPermissionService } from '../../../../coreservices/services/system/linkpermissions/linkpermissions.service';
import { Response } from 'express';
import { Paginate } from '../../../../coretoolkit/decorators/pagination.decorator';
import { Schemas } from '../../../../coretoolkit/decorators/schema.decorator';
import { ValidateService } from '../../../../coretoolkit/decorators/servicevalidate.decorator';
import { IController } from '../../../controller.interface';
import { LinkPermission } from '../../../../entities/core/linkpermissions.entity';
import { ModuleLink } from '../../../../entities/core/modulelinks.entity';
import {
  ApiCreatePermission,
  ApiDeletePermission,
  ApiUpdatePermission,
  ApiViewPermissions,
  ApiViewSelectPermissions,
} from '../../../core/system/linkpermission/linkpermission.swagger';
import { AuthGuard } from '../../../../authguards/guards/auth.guard';
import { ROLE } from '../../../../coretoolkit/types/enums/enums';
import { Service } from '../../../../coretoolkit/decorators/param.decorator';

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
  async Create(
    @Res() res: Response,
    @Service('modulelink') modulelink: ModuleLink,
  ) {
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
