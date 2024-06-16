import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './users.service';
import { UsersController } from './users.controller';
import { TokenModule } from '../../tokens/tokens.module';
import { PositionModule } from '../../positions/positions.module';
import { RoleModule } from '../roles/roles.module';
import { SystemRolesModule } from '../systemroles/systemroles.module';
import { RefreshTokenModule } from '../refreshtokens/refreshtokens.module';

@Module({
  imports: [
    TokenModule,
    PositionModule,
    RoleModule,
    SystemRolesModule,
    forwardRef(() => RefreshTokenModule),
  ],
  providers: [UserService],
  controllers: [UsersController],
  exports: [UserService],
})
export class UserModule {}
