import { IsOptional, IsString, Length } from 'class-validator';

export class UserGroupDTO {
  @IsString({ message: 'Group Name must be a string' })
  @Length(3, 20, { message: 'Group Name must be between 3 and 20 characters' })
  groupName: string;
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description: string;
}
