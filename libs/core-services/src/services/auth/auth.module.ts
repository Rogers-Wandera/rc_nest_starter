import { Global, Module } from '@nestjs/common';
import { UserModule } from './users/users.module';
import { TokenModule } from '../system/tokens/tokens.module';
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from './roles/roles.module';
import { RefreshTokenModule } from './refreshtokens/refreshtokens.module';
import { SystemRolesModule } from './systemroles/systemroles.module';
import { PositionModule } from '../system/positions/positions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LinkRoleModule } from './linkroles/linkroles.module';
import { RolePermissionModule } from './rolepermissions/rolepermission.module';
import { ServerRouteRoleModule } from './serverrouteroles/serverrouteroles.module';
import { EnvConfig, jwtconfig } from '@toolkit/core-toolkit/config/config';

@Global()
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
    RolePermissionModule,
    ServerRouteRoleModule,
  ],
  exports: [
    UserModule,
    SystemRolesModule,
    JwtModule,
    RefreshTokenModule,
    RoleModule,
    RolePermissionModule,
    LinkRoleModule,
  ],
})
export class AuthModule {}
