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
import { Request, Response } from 'express';
import { JoiValidator } from 'src/app/context/interceptors/joi.interceptor';
import { Paginate } from 'src/app/decorators/pagination.decorator';
import { Role, Roles } from 'src/app/decorators/roles.decorator';
import { Position } from 'src/entity/core/positions.entity';
import { PositionsSchema } from 'src/schemas/core/system/positions.schema';
import {
  EMailGuard,
  JwtGuard,
  RolesGuard,
} from 'src/services/core/auth/authguards/authguard.guard';
import { PositionService } from 'src/services/core/system/positions/positions.service';

@Controller('/core/system/positions')
@UseGuards(JwtGuard, EMailGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PositionController {
  constructor(private readonly model: PositionService) {}
  @Post()
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
