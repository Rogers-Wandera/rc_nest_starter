import { Module, forwardRef } from '@nestjs/common';
import { RefreshTokenService } from './refreshtokens.service';
import { UserModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
