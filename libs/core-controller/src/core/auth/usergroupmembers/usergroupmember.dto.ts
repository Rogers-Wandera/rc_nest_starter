import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UserGroupMemberDTO {
  @IsNotEmpty()
  @IsString()
  @IsUUID(4)
  userId: string;
}
