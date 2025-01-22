import { IsNumber, IsNotEmpty } from 'class-validator';

export class TransferLinkDTO {
  @IsNumber()
  @IsNotEmpty()
  linkId: number;
  @IsNumber()
  @IsNotEmpty()
  moduleId: number;
}
