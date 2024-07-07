import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PositionsSchema } from 'src/schemas/core/system/positions.schema';
import j2s from 'joi-to-swagger';
import { PaginateDTO, paginatepropsDto } from 'src/app/conn/conntypes';

export function ApiAddPosition() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add a new position',
      description: 'This endpoint is for adding positions in the system',
    }),
    ApiResponse({ status: 200, description: 'Position added successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiBody({ schema: j2s(PositionsSchema).swagger }),
  );
}

export function ApiGetPositions() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all positions',
      description:
        'This endpoint gets positions based on the pagination query params provided',
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

export function ApiUpdatePosition() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a position',
      description: 'This endpoint updates the position in the system',
    }),
    ApiResponse({ status: 200, description: 'Position updated successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', description: 'Position ID' }),
    ApiBody({ schema: j2s(PositionsSchema).swagger }),
  );
}

export function ApiDeletePosition() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a position',
      description: 'This endpoint is for deleting positions from the system',
    }),
    ApiResponse({ status: 200, description: 'Position deleted successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', description: 'Position ID' }),
  );
}
