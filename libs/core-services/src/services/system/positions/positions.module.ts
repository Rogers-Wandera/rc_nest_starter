import { Module, forwardRef } from '@nestjs/common';
import { PositionService } from './positions.service';
import { UserModule } from '../../auth/users/users.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}
