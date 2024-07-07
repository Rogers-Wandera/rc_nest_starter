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
import { PaginateDTO, paginatepropsDto } from 'src/app/conn/conntypes';
import { modulelinksschema } from 'src/services/core/system/modulelinks/modulelinks.schema';

export function ApiCreateModuleLink() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new module link',
      description: 'This end point is for creating module links in the system',
    }),
    ApiResponse({ status: 200, description: 'Link added successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'moduleId', description: 'Module ID' }),
    ApiBody({ schema: j2s(modulelinksschema).swagger }),
  );
}

export function ApiUpdateModuleLink() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a module link' }),
    ApiResponse({ status: 200, description: 'Link updated successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'linkId', description: 'Link ID' }),
    ApiBody({ schema: j2s(modulelinksschema).swagger }),
  );
}

export function ApiViewModuleLinks() {
  return applyDecorators(
    ApiOperation({
      summary: 'View module links by Module ID',
      description:
        'This endpoint is for viewing module links for a particular module',
    }),
    ApiQuery({
      type: paginatepropsDto,
    }),
    ApiResponse({
      status: 200,
      type: PaginateDTO,
      description: 'Returns an object containing the paginated data',
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'moduleId', description: 'Module ID' }),
  );
}

export function ApiDeleteModuleLink() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a module link',
      description: 'This endpoint is for deleting a module from the system',
    }),
    ApiResponse({ status: 200, description: 'Link deleted successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'linkId', description: 'Link ID' }),
  );
}
