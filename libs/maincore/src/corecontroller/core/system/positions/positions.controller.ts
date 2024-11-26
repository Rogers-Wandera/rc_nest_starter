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
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Paginate } from '../../../../coretoolkit/decorators/pagination.decorator';
import { Permissions } from '../../../../coretoolkit/decorators/permissions.decorator';
import { IController } from '../../../controller.interface';
import { Position } from '../../../../entities/core/positions.entity';
import { PositionsSchema } from '../../../schemas/core/system/positions.schema';
import { PositionService } from '../../../../coreservices/services/system/positions/positions.service';
import { JoiValidator } from '../../../../coretoolkit/contexts/interceptors/joi.interceptor';
import {
  ApiAddPosition,
  ApiDeletePosition,
  ApiGetPositions,
  ApiUpdatePosition,
} from '../../../core/system/positions/positions.swagger';
import { AuthGuard } from '../../../../authguards/guards/auth.guard';
import { ROLE } from '../../../../coretoolkit/types/enums/enums';

@Controller('/core/system/positions')
@ApiTags('Positions')
@Permissions({
  module: 'User Management',
  moduleLink: 'Positions',
})
@AuthGuard(ROLE.ADMIN)
export class PositionController extends IController<PositionService> {
  constructor(model: PositionService) {
    super(model);
  }
  @Post()
  @ApiAddPosition()
  @UseInterceptors(new JoiValidator(PositionsSchema, 'body'))
  async AddPositions(
    @Body() body: Partial<Position>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      this.model.entity.position = body.position;
      this.model.entity.createdBy = req.user.id;
      const response = await this.model.createPosition();
      const message = response.success
        ? 'Position added successfully'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg: message, data: {} });
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiGetPositions()
  @Paginate()
  async GetPositions(@Res() res: Response) {
    try {
      const data = await this.model.ViewPositions();
      res.status(HttpStatus.OK).json(data);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @ApiUpdatePosition()
  @UseInterceptors(new JoiValidator(PositionsSchema, 'body'))
  async UpdatePositions(
    @Param('id', new ParseIntPipe())
    id: number,
    @Body() body: Partial<Position>,
    @Res() res: Response,
  ) {
    try {
      this.model.entity.position = body.position;
      this.model.entity.id = id;
      const response = await this.model.UpdatePosition();
      const message = response
        ? 'Position updated successfully'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg: message });
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiDeletePosition()
  async DeletePosition(
    @Param('id', new ParseIntPipe())
    id: number,
    @Res() res: Response,
  ) {
    try {
      this.model.entity.id = id;
      const response = await this.model.DeletePosition();
      const message = response
        ? 'Position deleted successfully'
        : 'Something went wrong';
      res.status(HttpStatus.OK).json({ msg: message });
    } catch (error) {
      throw error;
    }
  }
}
