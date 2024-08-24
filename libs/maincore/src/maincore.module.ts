import { Module } from '@nestjs/common';
import { MaincoreService } from './maincore.service';
import { DataBridgeModule } from './databridge/databridge.module';
import { CoreServicesModule } from './coreservices/core-services.module';
import { CoreToolkitModule } from './coretoolkit/coretoolkit.module';
import { CoreControllerModule } from './corecontroller/core-controller.module';
import { AuthGuardsModule } from './authguards/auth-guards.module';

@Module({
  imports: [
    DataBridgeModule,
    CoreToolkitModule,
    CoreServicesModule,
    CoreControllerModule,
    AuthGuardsModule,
  ],
  providers: [MaincoreService],
  exports: [
    MaincoreService,
    DataBridgeModule,
    CoreToolkitModule,
    CoreServicesModule,
    CoreControllerModule,
    AuthGuardsModule,
  ],
})
export class MaincoreModule {}
