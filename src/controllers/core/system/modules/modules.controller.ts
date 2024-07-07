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
import { ModulesSchema } from 'src/services/core/system/modules/module.schema';
import { ModuleService } from 'src/services/core/system/modules/modules.service';
import {
  ApiCreateModule,
  ApiDeleteModule,
  ApiUpdateModule,
  ApiViewModules,
  ApiViewSelectModules,
} from 'src/swagger/controllers/core/modulescontroller';

@Controller('/core/system/modules')
@ApiTags('Modules')
@Roles(Role.ADMIN)
@Permissions({
  module: 'Modules',
  moduleLink: 'Manage Modules',
  name: 'Modules',
})
@UseGuards(JwtGuard, EMailGuard, RolesGuard)
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
