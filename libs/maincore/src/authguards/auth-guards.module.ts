import { Module } from '@nestjs/common';
import { EMailGuard } from './guards/email.guard';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { RefreshTokenGuard } from './guards/refresh.guard';

@Module({
  providers: [EMailGuard, JwtGuard, RolesGuard, RefreshTokenGuard],
  exports: [EMailGuard, JwtGuard, RolesGuard, RefreshTokenGuard],
})
export class AuthGuardsModule {}
