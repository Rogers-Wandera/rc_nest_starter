import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

export function ApiCreatePermission() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add Role Permission',
      description: 'This api endpoint will add role permissions to users',
    }),
    ApiParam({ name: 'roleId', description: 'Role ID', type: 'number' }),
    ApiParam({
      name: 'permissionId',
      description: 'Permission ID',
      type: 'number',
    }),
    ApiParam({ name: 'userId', description: 'User ID', type: 'string' }),
    ApiResponse({ status: 200, description: 'Permission added successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
  );
}

export function ApiDeletePermission() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a permission' }),
    ApiResponse({
      status: 200,
      description: 'Permission deleted successfully',
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiParam({ name: 'id', description: 'Permission ID' }),
    ApiBearerAuth(),
  );
}

export function ApiViewPermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'View permissions for a user' }),
    ApiResponse({
      status: 200,
      description:
        'Return an array of the permissions assigned to user for a specific link (Module Link)',
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiParam({ name: 'userId', description: 'User ID' }),
    ApiParam({ name: 'linkId', description: 'Link ID' }),
    ApiBearerAuth(),
  );
}
