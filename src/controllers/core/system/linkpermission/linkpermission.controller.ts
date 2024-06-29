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
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Paginate } from 'src/app/decorators/pagination.decorator';
import { Role, Roles } from 'src/app/decorators/roles.decorator';
import { Schemas } from 'src/app/decorators/schema.decorator';
import { ValidateService } from 'src/app/decorators/servicevalidate.decorator';
import { IController } from 'src/controllers/controller.interface';
import { LinkPermission } from 'src/entity/core/linkpermissions.entity';
import { ModuleLink } from 'src/entity/core/modulelinks.entity';
import {
  EMailGuard,
  JwtGuard,
  RolesGuard,
} from 'src/services/core/auth/authguards/authguard.guard';
import { PermissionSchema } from 'src/services/core/system/linkpermissions/linkpermission.schema';
import { LinkPermissionService } from 'src/services/core/system/linkpermissions/linkpermissions.service';

@Controller('/core/system/linkpermission')
@UseGuards(JwtGuard, EMailGuard, RolesGuard)
@Roles(Role.ADMIN)
export class LinkPermissionController extends IController<LinkPermissionService> {
  constructor(model: LinkPermissionService) {
    super(model);
  }
  @Post(':moduleLinkId')
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
