import { LinkRoleDTO } from '@core/maincore/coreservices/services/auth/linkroles/linkroles.schema';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

export function ApiCreateLinkRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new link role' }),
    ApiResponse({ status: 200, description: 'Role added successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiBody({ type: LinkRoleDTO }),
  );
}

export function ApiDeleteLinkRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a link role' }),
    ApiResponse({ status: 200, description: 'Role removed successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', description: 'Link Role ID' }),
  );
}

export function ApiUpdateLinkRole() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a link role' }),
    ApiResponse({ status: 200, description: 'Role updated successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', description: 'Link Role ID' }),
    ApiBody({ type: LinkRoleDTO }),
  );
}

export function ApiGetUserModules() {
  return applyDecorators(
    ApiOperation({ summary: 'Get modules assigned to a user' }),
    ApiResponse({ status: 200, description: 'Modules retrieved successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'userId', description: 'User ID' }),
  );
}

export function ApiGetAssignedRoles() {
  return applyDecorators(
    ApiOperation({ summary: 'Get assigned roles for a user' }),
    ApiResponse({ status: 200, description: 'Roles retrieved successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'userId', description: 'User ID' }),
  );
}

export function ApiGetUnassignedRoles() {
  return applyDecorators(
    ApiOperation({ summary: 'Get unassigned roles for a user' }),
    ApiResponse({ status: 200, description: 'Roles retrieved successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'userId', description: 'User ID' }),
  );
}
