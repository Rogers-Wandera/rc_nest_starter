import { Module } from '@nestjs/common';
import { SystemRolesService } from './systemroles.service';
import { SystemRolesController } from './systemroles.controller';

@Module({
  providers: [SystemRolesService],
  controllers: [SystemRolesController],
})
export class SystemRolesModule {}
