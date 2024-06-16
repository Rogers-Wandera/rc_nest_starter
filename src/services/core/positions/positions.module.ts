import { Module } from '@nestjs/common';
import { PositionService } from './positions.service';
import { PositionController } from './positions.controller';

@Module({
  providers: [PositionService],
  controllers: [PositionController],
  exports: [PositionService],
})
export class PositionModule {}
