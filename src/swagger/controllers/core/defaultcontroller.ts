import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const AddPermissionsDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Add Permissions',
      description:
        'This is a protected endpoint that will generate route permissions from the controllers',
    }),
    ApiResponse({
      status: 200,
      description: 'Permissions added successfully',
    }),
    ApiBearerAuth(),
  );
};

export const GetPermissionsDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Controller Permissions',
      description:
        'This is a protected endpoint that will get all route permissions from the controllers',
    }),
    ApiResponse({
      status: 200,
      description: 'It will return an array of the permissions',
    }),
    ApiBearerAuth(),
  );
};
