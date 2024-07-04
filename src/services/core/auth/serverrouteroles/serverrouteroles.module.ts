import { Module } from '@nestjs/common';
import { ServerRouteRoleService } from './serverrouteroles.service';
import { ServerRouteMethodModule } from '../serverroutemethods/serverroutemethods.module';

@Module({
  imports: [ServerRouteMethodModule],
  providers: [ServerRouteRoleService],
  controllers: [],
  exports: [ServerRouteRoleService],
})
export class ServerRouteRoleModule {}
