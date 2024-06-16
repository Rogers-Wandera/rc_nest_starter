import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PositionModule } from './positions/positions.module';
@Module({
  imports: [
    AuthModule,
    PositionModule,
  ],
  exports: [AuthModule, PositionModule],
})
export class CoreModules {}
