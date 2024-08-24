import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Systemrole } from '../../../../entities/core/systemroles.entity';
import { SystemRolesSchema } from '../../../schemas/core/auth/systemroles.schema';
import j2s from 'joi-to-swagger';
import {
  PaginateDTO,
  paginatepropsDto,
} from '../../../../coretoolkit/types/coretypes';

export const ViewSystemRolesDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'View Roles',
      description:
        'This end point returns all system roles registered in the system',
    }),
    ApiQuery({
      type: paginatepropsDto,
    }),
    ApiResponse({
      status: 200,
      type: PaginateDTO<Systemrole>,
      description: 'This will return the paginated system roles',
    }),
    ApiBearerAuth(),
  );
};

export const AddSystemRolesDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Add Roles',
      description: 'This endpoint will add system roles to the system',
    }),

    ApiBody({
      description: 'The data for adding the system role',
      schema: j2s(SystemRolesSchema).swagger,
    }),
    ApiResponse({
      status: 200,
      description:
        'This will return a success message of System role added successfully incase added else will return something went wrong',
    }),
    ApiBearerAuth(),
  );
};

export const UpdateSystemRolesDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update Roles',
      description: 'This endpoint will update system roles to the system',
    }),
    ApiBody({
      description: 'The data for updating the system role',
      schema: j2s(SystemRolesSchema).swagger,
    }),
    ApiResponse({
      status: 200,
      description:
        'This will return a success message of System role updated successfully incase updated else will return something went wrong',
    }),
    ApiBearerAuth(),
  );
};

export const DeleteSystemRoleDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete Roles',
      description: 'This endpoint will delete system roles from the system',
    }),
    ApiResponse({
      status: 200,
      description:
        'This will return a success message of System role deleted successfully incase deleted else will return something went wrong',
    }),
    ApiBearerAuth(),
  );
};

export const GetUnassignedRolesDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Unassigned Roles',
      description:
        'This endpoint will get all system roles that are not assigned to aparticular user',
    }),
    ApiResponse({
      status: 200,
      description:
        'Will return an array of unassigned roles else an empty array if all roles are assigned',
    }),
    ApiBearerAuth(),
  );
};
