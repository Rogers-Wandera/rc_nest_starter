import { Module } from '@nestjs/common';
import { PositionModule } from './positions/positions.module';

@Module({
  imports: [PositionModule],
  providers: [],
  exports: [],
})
export class SystemModule {}
