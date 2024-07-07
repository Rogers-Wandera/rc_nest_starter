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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JoiValidator } from 'src/app/context/interceptors/joi.interceptor';
import { Paginate } from 'src/app/decorators/pagination.decorator';
import { Permissions } from 'src/app/decorators/permissions.decorator';
import { Role, Roles } from 'src/app/decorators/roles.decorator';
import { IController } from 'src/controllers/controller.interface';
import { Position } from 'src/entity/core/positions.entity';
import { PositionsSchema } from 'src/schemas/core/system/positions.schema';
import {
  EMailGuard,
  JwtGuard,
  RolesGuard,
} from 'src/services/core/auth/authguards/authguard.guard';
import { PositionService } from 'src/services/core/system/positions/positions.service';
import {
  ApiAddPosition,
  ApiDeletePosition,
  ApiGetPositions,
  ApiUpdatePosition,
} from 'src/swagger/controllers/core/positions';

@Controller('/core/system/positions')
@ApiTags('Positions')
@UseGuards(JwtGuard, EMailGuard, RolesGuard)
@Permissions({
  module: 'User Management',
  moduleLink: 'Positions',
})
@Roles(Role.ADMIN)
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
  async UpadatePositions(
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
