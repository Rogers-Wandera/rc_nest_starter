import { UserGroup } from '../../../../entities/core/usergroups.entity';
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
import {
  PaginateDTO,
  paginatepropsDto,
} from '../../../../coretoolkit/types/coretypes';
import { UserGroupDTO } from './usergroup.dto';

export const ApiViewUserGroups = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'View User Groups',
      description: 'This end point returns all groups.',
    }),
    ApiQuery({
      type: paginatepropsDto,
    }),
    ApiResponse({
      status: 200,
      type: PaginateDTO<UserGroup>,
      description: 'This will return the paginated usergroup members',
    }),
    ApiBearerAuth(),
  );
};

export function ApiCreateUserGroup() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new user group in an existing system',
    }),
    ApiCreatedResponse({
      description: 'The record has been successfully created.',
      type: UserGroupDTO,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request incase of any error',
    }),
    ApiBearerAuth(),
    ApiBody({ type: UserGroup }),
  );
}

export const ApiRemoveUserGroup = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete Group',
      description: 'This endpoint will delete a group',
    }),
    ApiParam({
      name: 'id',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'This will return a success message incase deleted',
    }),
    ApiBearerAuth(),
  );
};

export function ApiUpdateUserGroup() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a new user group in an existing system',
    }),
    ApiCreatedResponse({
      description: 'The record has been successfully updated.',
      type: UserGroupDTO,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request incase of any error',
    }),
    ApiBearerAuth(),
    ApiBody({ type: UserGroup }),
    ApiParam({
      name: 'id',
      description: 'The ID of the group to update',
      required: true,
    }),
  );
}
