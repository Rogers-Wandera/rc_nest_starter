import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { UserGroupMemberDTO } from './usergroupmember.dto';
import {
  PaginateDTO,
  paginatepropsDto,
} from '@toolkit/core-toolkit/types/coretypes';
import { UserGroupMember } from '@entity/entities/core/usergroupmembers.entity';

export const ViewGroupmembers = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'View Group Members',
      description:
        'This end point returns all group members registered on a certain group',
    }),
    ApiQuery({
      type: paginatepropsDto,
    }),
    ApiResponse({
      status: 200,
      type: PaginateDTO<UserGroupMember>,
      description: 'This will return the paginated usergroup members',
    }),
    ApiBearerAuth(),
  );
};

export function ApiCreateUserGroupMember() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new user group member in an existing system',
    }),
    ApiCreatedResponse({
      description: 'The record has been successfully created.',
      type: UserGroupMemberDTO,
    }),
    // ApiResponse({ status: 200, description: 'Member add successfully' }),
    ApiResponse({
      status: 400,
      description: 'Bad Request incase of any error',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'groupId',
      description: 'The ID of the group to add the member to',
      required: true,
    }),
    ApiBody({ type: UserGroupMemberDTO }),
  );
}

export const RemoveUserGroupMember = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete Group Member',
      description: 'This endpoint will delete member from the group',
    }),
    ApiParam({
      name: 'id',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description:
        'This will return a success message of Member removed successfully incase deleted',
    }),
    ApiBearerAuth(),
  );
};
