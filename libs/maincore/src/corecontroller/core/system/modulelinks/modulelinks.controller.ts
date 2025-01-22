import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { modulelinksschema } from '../../../../coreservices/services/system/modulelinks/modulelinks.schema';
import { ModuleLinksService } from '../../../../coreservices/services/system/modulelinks/modulelinks.service';
import { Response } from 'express';
import { Paginate } from '../../../../coretoolkit/decorators/pagination.decorator';
import { Permissions } from '../../../../coretoolkit/decorators/permissions.decorator';
import { Schemas } from '../../../../coretoolkit/decorators/schema.decorator';
import { IController } from '../../../controller.interface';
import {
  ApiCreateModuleLink,
  ApiDeleteModuleLink,
  ApiUpdateModuleLink,
  ApiViewModuleLinks,
} from '../../../core/system/modulelinks/modulelinks.swagger';
import { AuthGuard } from '../../../../authguards/guards/auth.guard';
import { ROLE } from '../../../../coretoolkit/types/enums/enums';
import { Only } from '@core/maincore/authguards/decorators/only.guard';
import { ValidateService } from '@core/maincore/coretoolkit/decorators/servicevalidate.decorator';
import { ModuleLink } from '@core/maincore/entities/core/modulelinks.entity';
import { ClassValidator } from '@core/maincore/coretoolkit/decorators/classvalidator.decorator';
import { TransferLinkDTO } from './link.dto';
import { Module } from '@core/maincore/entities/core/modules.entity';
import { Service } from '@core/maincore/coretoolkit/decorators/param.decorator';

@Controller('/core/system/modulelinks')
@ApiTags('Module Links')
@Permissions({
  module: 'Modules',
  moduleLink: 'Manage Modules',
  name: 'Links',
})
@AuthGuard(ROLE.ADMIN)
export class ModuleLinksController extends IController<ModuleLinksService> {
  constructor(model: ModuleLinksService) {
    super(model);
  }
  @Post(':moduleId')
  @Only(ROLE.PROGRAMMER)
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
  @ValidateService({ entity: ModuleLink })
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
  @Only(ROLE.PROGRAMMER)
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

  @Patch('/transfer/link')
  @Only(ROLE.PROGRAMMER)
  @ClassValidator({ classDTO: TransferLinkDTO })
  @ValidateService([
    { entity: ModuleLink, type: 'body', key: 'linkId' },
    { entity: Module, type: 'body', key: 'moduleId' },
  ])
  async TransferLink(
    @Service('module') module: Module,
    @Service('modulelink') modulelink: ModuleLink,
    @Body() body: TransferLinkDTO,
  ) {
    try {
      this.model.entity = modulelink;
      await this.model.TransferLink(body.moduleId, module);
      return {
        msg:
          this.model.entity.linkname +
          ' transfered to ' +
          module.name +
          ' Module successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
