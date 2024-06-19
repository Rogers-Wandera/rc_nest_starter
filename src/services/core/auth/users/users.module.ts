import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './users.service';
import { TokenModule } from '../../system/tokens/tokens.module';
import { PositionModule } from '../../system/positions/positions.module';
import { RoleModule } from '../roles/roles.module';
import { SystemRolesModule } from '../systemroles/systemroles.module';
import { RefreshTokenModule } from '../refreshtokens/refreshtokens.module';
import { UsersController } from 'src/controllers/core/auth/users/users.controller';

@Module({
  imports: [
    TokenModule,
    forwardRef(() => PositionModule),
    RoleModule,
    forwardRef(() => SystemRolesModule),
    forwardRef(() => RefreshTokenModule),
  ],
  providers: [UserService],
  controllers: [UsersController],
  exports: [UserService],
})
export class UserModule {}
