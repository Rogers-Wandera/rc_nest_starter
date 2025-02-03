import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class LockUserDTO {
  @IsNotEmpty()
  @IsNumber()
  isLocked: number;
  @IsOptional()
  @IsString()
  reason: string;
}
