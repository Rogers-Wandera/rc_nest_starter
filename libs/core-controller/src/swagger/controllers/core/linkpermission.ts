import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import j2s from 'joi-to-swagger';
import { PermissionSchema } from '@services/core-services/services/system/linkpermissions/linkpermission.schema';
import {
  PaginateDTO,
  paginatepropsDto,
} from '@bridge/data-bridge/config/conntypes';

export function ApiCreatePermission() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new permission',
      description:
        'This endpoint is for creating permissions for a module link',
    }),
    ApiResponse({ status: 200, description: 'Permission added successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({
      name: 'moduleLinkId',
      description: 'Module Link ID for module links',
    }),
    ApiBody({
      schema: j2s(PermissionSchema).swagger,
      description: 'This is data for adding a permissionon a module link',
    }),
  );
}

export function ApiUpdatePermission() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a permission',
      description:
        'This end point is for updating permissions set on module links',
    }),
    ApiResponse({
      status: 200,
      description: 'Permission updated successfully',
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'linkId', description: 'Link ID' }),
    ApiBody({
      schema: j2s(PermissionSchema).swagger,
      description: 'This is the data for updating the permission',
    }),
  );
}

export function ApiViewPermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'View permissions by Module Link ID' }),
    ApiQuery({
      type: paginatepropsDto,
    }),
    ApiResponse({
      status: 200,
      type: PaginateDTO,
      description: 'Returns an an object containing the paginate data',
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'moduleLinkId', description: 'Module Link ID' }),
  );
}

export function ApiViewSelectPermissions() {
  return applyDecorators(
    ApiOperation({ summary: 'View selected permissions by Module Link ID' }),
    ApiResponse({
      status: 200,
      description:
        'Returns an array containg data for select options on the front end',
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'moduleLinkId', description: 'Module Link ID' }),
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
    ApiBearerAuth(),
    ApiParam({ name: 'linkId', description: 'Link ID' }),
  );
}
