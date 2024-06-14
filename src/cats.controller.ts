import { Controller, Get, Param, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig, dbconfig } from './app/config/configuration';

@Controller('cats')
export class CatsController {
  constructor(private configService: ConfigService<EnvConfig>) {}
  @Get()
  findAll(): string {
    const dbconfig = this.configService.get<dbconfig>('database');
    return 'This action returns all cats';
  }

  @Post()
  create(): string {
    return 'This action adds a new cat';
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return `This action returns a #${id} cat`;
  }
}
