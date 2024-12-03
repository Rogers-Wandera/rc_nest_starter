import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ModuleDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(3, 30)
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  position: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(3, 50)
  icon: string;
}

export class UpdateModuleDTO extends PartialType(ModuleDTO) {}
