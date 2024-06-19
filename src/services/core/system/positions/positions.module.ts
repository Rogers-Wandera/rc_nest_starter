import { Module, forwardRef } from '@nestjs/common';
import { PositionService } from './positions.service';
import { PositionController } from '../../../../controllers/core/system/positions/positions.controller';
import { UserModule } from '../../auth/users/users.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [PositionService],
  controllers: [PositionController],
  exports: [PositionService],
})
export class PositionModule {}
