import { Module } from '@nestjs/common';
import { UserModule } from './users/users.module';
import { TokenModule } from '../system/tokens/tokens.module';
import { JwtModule } from '@nestjs/jwt';
import { EnvConfig, jwtconfig } from 'src/app/config/configuration';
import { RoleModule } from './roles/roles.module';
import { RefreshTokenModule } from './refreshtokens/refreshtokens.module';
import { SystemRolesModule } from './systemroles/systemroles.module';
import { PositionModule } from '../system/positions/positions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LinkRoleModule } from './linkroles/linkroles.module';

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
    LinkRoleModule,
  ],
  exports: [
    UserModule,
    SystemRolesModule,
    JwtModule,
    RefreshTokenModule,
    RoleModule,
  ],
})
export class AuthModule {}
