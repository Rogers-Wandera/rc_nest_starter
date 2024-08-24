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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ModulesSchema } from '../../../../coreservices/services/system/modules/module.schema';
import { ModuleService } from '../../../../coreservices/services/system/modules/modules.service';
import { Paginate } from '../../../../coretoolkit/decorators/pagination.decorator';
import { Permissions } from '../../../../coretoolkit/decorators/permissions.decorator';
import { Schemas } from '../../../../coretoolkit/decorators/schema.decorator';
import { Response } from 'express';
import { IController } from '../../../controller.interface';
import {
  ApiCreateModule,
  ApiDeleteModule,
  ApiUpdateModule,
  ApiViewModules,
  ApiViewSelectModules,
} from '../../../core/system/modules/modules.swagger';
import { AuthGuard } from '../../../../authguards/guards/auth.guard';
import { ROLE } from '../../../../coretoolkit/types/enums/enums';

@Controller('/core/system/modules')
@ApiTags('Modules')
@Permissions({
  module: 'Modules',
  moduleLink: 'Manage Modules',
  name: 'Modules',
})
@AuthGuard(ROLE.ADMIN)
export class ModulesController extends IController<ModuleService> {
  constructor(model: ModuleService) {
    super(model);
  }
  @Post()
  @ApiCreateModule()
  @Schemas({ type: 'body', schemas: [ModulesSchema] })
  async Create(@Res() res: Response) {
    try {
      await this.model.addModule();
      res.status(HttpStatus.OK).json({ msg: 'Module added successfully' });
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @Paginate()
  @ApiViewModules()
  async View(@Res() res: Response) {
    try {
      const results = await this.model.viewModules();
      res.status(HttpStatus.OK).json(results);
    } catch (error) {
      throw error;
    }
  }

  @Get('selects')
  @ApiViewSelectModules()
  async ViewSelects(@Res() res: Response) {
    try {
      const results = await this.model.getSelectModules();
      res.status(HttpStatus.OK).json(results);
    } catch (error) {
      throw error;
    }
  }

  @Patch('/:moduleId')
  @ApiUpdateModule()
  @Schemas({ type: 'body', schemas: [ModulesSchema] })
  async Update(
    @Res() res: Response,
    @Param('moduleId', new ParseIntPipe()) id: number,
  ) {
    try {
      this.model.entity.id = id;
      const response = await this.model.updateModule();
      const msg = response
        ? 'Module updated successfully'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }

  @Delete('/:moduleId')
  @ApiDeleteModule()
  async Delete(
    @Res() res: Response,
    @Param('moduleId', new ParseIntPipe()) id: number,
  ) {
    try {
      this.model.entity.id = id;
      const response = await this.model.deleteModule();
      const msg = response
        ? 'Module deleted successfully'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg });
    } catch (error) {
      throw error;
    }
  }
}
