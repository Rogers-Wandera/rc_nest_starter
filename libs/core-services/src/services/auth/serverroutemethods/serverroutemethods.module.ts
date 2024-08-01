import { Module } from '@nestjs/common';
import { ServerRouteMethodService } from './serverroutemethod.service';

@Module({
  providers: [ServerRouteMethodService],
  exports: [ServerRouteMethodService],
})
export class ServerRouteMethodModule {}
