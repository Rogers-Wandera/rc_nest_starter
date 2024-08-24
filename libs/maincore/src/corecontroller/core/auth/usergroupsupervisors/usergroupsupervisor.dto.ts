import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class UserGroupSupervisorDTO {
  @IsNotEmpty()
  @IsString()
  @IsUUID(4)
  userId: string;
  @IsNotEmpty()
  @IsNumber()
  groupId: number;
}
