import { IsNotEmpty, IsNumber } from 'class-validator';

export class LockUserDTO {
  @IsNotEmpty()
  @IsNumber()
  isLocked: number;
}
