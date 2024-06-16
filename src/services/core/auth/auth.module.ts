import { Module } from '@nestjs/common';
import { UserModule } from './users/users.module';
import { TokenModule } from '../tokens/tokens.module';
import { JwtModule } from '@nestjs/jwt';
import { EnvConfig, envconfig, jwtconfig } from 'src/app/config/configuration';
import { RoleModule } from './roles/roles.module';
import { RefreshTokenModule } from './refreshtokens/refreshtokens.module';
import { SystemRolesModule } from './systemroles/systemroles.module';
import { PositionModule } from '../positions/positions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  VerifyEMailGuard,
  VerifyJwtGuard,
  VerifyRefreshTokenGuard,
} from './authguards/authguard.guard';

@Module({
  imports: [
    UserModule,
    RoleModule,
    TokenModule,
    SystemRolesModule,
    PositionModule,
    RefreshTokenModule,
    {
      ...JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService<EnvConfig>) => ({
          global: true,
          secret: configService.get<jwtconfig>('jwt').secret,
          signOptions: { expiresIn: '1h' },
        }),
        inject: [ConfigService],
      }),
      global: true,
    },
  ],
  providers: [VerifyEMailGuard, VerifyRefreshTokenGuard, VerifyJwtGuard],
  exports: [
    UserModule,
    SystemRolesModule,
    JwtModule,
    RefreshTokenModule,
    RoleModule,
  ],
})
export class AuthModule {}
