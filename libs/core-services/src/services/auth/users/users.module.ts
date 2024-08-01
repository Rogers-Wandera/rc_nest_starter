import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './users.service';
import { TokenModule } from '../../system/tokens/tokens.module';
import { PositionModule } from '../../system/positions/positions.module';
import { RoleModule } from '../roles/roles.module';
import { SystemRolesModule } from '../systemroles/systemroles.module';
import { RefreshTokenModule } from '../refreshtokens/refreshtokens.module';
import { UserUtilsService } from './user.utils.service';
import { UserProfileImageModule } from '../userprofileimages/userprofileimage.module';

@Module({
  imports: [
    TokenModule,
    forwardRef(() => PositionModule),
    RoleModule,
    forwardRef(() => SystemRolesModule),
    forwardRef(() => RefreshTokenModule),
    UserProfileImageModule,
  ],
  providers: [UserService, UserUtilsService],
  exports: [UserService, UserUtilsService],
})
export class UserModule {}
