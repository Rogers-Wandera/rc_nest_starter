import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Paginate } from 'src/app/decorators/pagination.decorator';
import { Permissions } from 'src/app/decorators/permissions.decorator';
import { Role, Roles } from 'src/app/decorators/roles.decorator';
import { Schemas } from 'src/app/decorators/schema.decorator';
import { IController } from 'src/controllers/controller.interface';
import {
  EMailGuard,
  JwtGuard,
  RolesGuard,
} from 'src/services/core/auth/authguards/authguard.guard';
import { modulelinksschema } from 'src/services/core/system/modulelinks/modulelinks.schema';
import { ModuleLinksService } from 'src/services/core/system/modulelinks/modulelinks.service';
import {
  ApiCreateModuleLink,
  ApiDeleteModuleLink,
  ApiUpdateModuleLink,
  ApiViewModuleLinks,
} from 'src/swagger/controllers/core/modulelinks';

@Controller('/core/system/modulelinks')
@ApiTags('Module Links')
@Roles(Role.ADMIN)
@UseGuards(JwtGuard, EMailGuard, RolesGuard)
@Permissions({
  module: 'Modules',
  moduleLink: 'Manage Modules',
  name: 'Links',
})
export class ModuleLinksController extends IController<ModuleLinksService> {
  constructor(model: ModuleLinksService) {
    super(model);
  }
  @Post(':moduleId')
  @ApiCreateModuleLink()
  @Schemas({ type: 'body', schemas: [modulelinksschema] })
  async Create(
    @Res() res: Response,
    @Param('moduleId', new ParseIntPipe()) id: number,
  ) {
    try {
      const response = await this.model.addModuleLink(id);
      const msg = response ? 'Link added successfully' : 'Something went wrong';
      return res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }
  @Patch(':linkId')
  @ApiUpdateModuleLink()
  @Schemas({ type: 'body', schemas: [modulelinksschema] })
  async Update(
    @Res() res: Response,
    @Param('linkId', new ParseIntPipe()) id: number,
  ) {
    try {
      this.model.entity.id = id;
      const results = await this.model.updateModeleLink();
      const msg = results
        ? 'Link updated successfully'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }

  @Delete(':linkId')
  @ApiDeleteModuleLink()
  async Delete(
    @Res() res: Response,
    @Param('linkId', new ParseIntPipe()) id: number,
  ) {
    try {
      this.model.entity.id = id;
      const response = await this.model.DeleteLink();
      const msg = response
        ? 'Link deleted successfully'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }

  @Paginate()
  @Get(':moduleId')
  @ApiViewModuleLinks()
  async View(
    @Res() res: Response,
    @Param('moduleId', new ParseIntPipe()) id: number,
  ) {
    try {
      const data = await this.model.ViewModuleLinks(id);
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }
}
