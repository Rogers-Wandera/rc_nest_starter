import { Module } from '@nestjs/common';
import { TokenService } from './tokens.service';

@Module({
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
