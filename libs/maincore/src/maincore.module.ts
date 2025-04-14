import { Module } from '@nestjs/common';
import { MaincoreService } from './maincore.service';
import { CoreServicesModule } from './coreservices/core-services.module';
import { CoreToolkitModule } from './coretoolkit/coretoolkit.module';
import { CoreControllerModule } from './corecontroller/core-controller.module';
import { AuthGuardsModule } from './authguards/auth-guards.module';

@Module({
  imports: [
    CoreToolkitModule,
    CoreServicesModule,
    CoreControllerModule,
    AuthGuardsModule,
  ],
  providers: [MaincoreService],
  exports: [
    MaincoreService,
    CoreToolkitModule,
    CoreServicesModule,
    CoreControllerModule,
    AuthGuardsModule,
  ],
})
export class MaincoreModule {}
