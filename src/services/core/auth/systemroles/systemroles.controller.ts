import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { SystemRolesService } from './systemroles.service';
import { PaginationSchema } from 'src/schemas/core/paginate.schema';
import { Systemrole } from 'src/entity/core/systemroles.entity';
import { JoiPaginateValidation } from 'src/app/context/interceptors/joi.interceptor';
import { TransformJson } from 'src/app/context/interceptors/jsonparser.interceptor';
import { paginateprops } from 'src/app/conn/conntypes';
import { Response } from 'express';
import { AllExceptionsFilter } from 'src/app/context/exceptions/http-exception.filter';

@Controller('/core/auth/roles')
@UseFilters(new AllExceptionsFilter())
export class SystemRolesController {
  constructor(private readonly systemrolesservice: SystemRolesService) {}
  @Get('/')
  @UseInterceptors(
    new TransformJson<paginateprops<Systemrole>>('sortBy', 'query'),
    new JoiPaginateValidation<Systemrole>(PaginationSchema<Systemrole>),
  )
  async ViewSystemRoles(
    @Query() query: paginateprops<Systemrole>,
    @Res() res: Response,
  ) {
    try {
      this.systemrolesservice.pagination = query;
      const data = await this.systemrolesservice.ViewSystemroles();
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }
}
