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
import { ModulesSchema } from 'src/services/core/system/modules/module.schema';

export function ApiCreateModule() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new module',
      description: 'This end point is for creating modules in the system',
    }),
    ApiResponse({ status: 200, description: 'Module added successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiBody({ schema: j2s(ModulesSchema).swagger }),
  );
}

export function ApiViewModules() {
  return applyDecorators(
    ApiOperation({
      summary: 'View all modules',
      description:
        'This endpoint is for viewing modules based on the provided query pagination params',
    }),
    ApiQuery({
      type: paginatepropsDto,
    }),
    ApiResponse({
      status: 200,
      type: PaginateDTO,
      description: 'Returns an object containing the pagination results',
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
  );
}

export function ApiViewSelectModules() {
  return applyDecorators(
    ApiOperation({ summary: 'View select modules' }),
    ApiResponse({
      status: 200,
      description:
        'Returns an array for the select options to be used on the front end',
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
  );
}

export function ApiUpdateModule() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a module',
      description: 'This end point is for updating the modules in the system',
    }),
    ApiResponse({ status: 200, description: 'Module updated successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'moduleId', description: 'Module ID' }),
    ApiBody({ schema: j2s(ModulesSchema).swagger }),
  );
}

export function ApiDeleteModule() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a module',
      description:
        'This api endpoint is for deleting the module from the system',
    }),
    ApiResponse({ status: 200, description: 'Module deleted successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'moduleId', description: 'Module ID' }),
  );
}
