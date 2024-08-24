import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import j2s from 'joi-to-swagger';
import { UserDataView } from '../../../../entities/coreviews/userdata.view';
import {
  AddRoleSchema,
  LoginSchema,
  ResetSchema,
  UserRegisterSchema,
} from '../../../schemas/core/user.schema';
import {
  PaginateDTO,
  paginatepropsDto,
} from '../../../../coretoolkit/types/coretypes';

export function RegisterUserDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register a new user',
      description: 'This endpoint registers a new user.',
    }),
    ApiBody({
      description: 'The data to register a new user',
      schema: j2s(UserRegisterSchema).swagger,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User created successfully',
    }),
  );
}

export function GenerateVerificationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resend verification email',
      description: 'This endpoint resends the verification email to a user.',
    }),
    ApiParam({
      name: 'userId',
      description: 'The ID of the user to resend the verification email to',
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Verification Sent Successfully',
    }),
  );
}

export const VerifyUserDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify a user',
      description: 'This endpoint verifies a user with the provided token.',
    }),
    ApiParam({
      name: 'userId',
      description: 'The ID of the user to verify',
      required: true,
    }),
    ApiParam({
      name: 'token',
      description: 'The verification token',
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Verification has been successful',
    }),
  );
};

export const LoginUserDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Login a user',
      description: 'This endpoint logs in a user.',
    }),
    ApiBody({
      description: 'The data to login a user',
      schema: j2s(LoginSchema).swagger,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User logged in successfully',
    }),
  );
};

export const RefreshTokenDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Refresh user token',
      description:
        'This endpoint refreshes the user token and assigns a new jwt token.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Session updated successfully',
    }),
    ApiBearerAuth(),
  );
};

export const AddRolesDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Add roles to a user',
      description: 'This endpoint adds roles to a user.',
    }),
    ApiBody({
      description: 'The data to add roles to a user',
      schema: j2s(AddRoleSchema).swagger,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Role created successfully',
    }),
    ApiBearerAuth(),
  );
};

export const RemoveRolesDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove roles from a user',
      description: 'This endpoint removes roles from a user.',
    }),
    ApiBody({
      description: 'The data to remove roles from a user',
      schema: j2s(AddRoleSchema).swagger,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Role deleted successfully',
    }),
    ApiBearerAuth(),
  );
};

export const GetUsersDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all users',
      description: 'This endpoint retrieves all users.',
    }),
    ApiQuery({
      type: paginatepropsDto<UserDataView>,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      type: PaginateDTO<UserDataView>,
      description: 'This will return an array of users',
    }),
    ApiBearerAuth(),
  );
};

export const DeleteUserDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a user',
      description: 'This endpoint deletes a user.',
    }),
    ApiParam({
      name: 'userId',
      type: 'UUID',
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User deleted successfully',
    }),
    ApiBearerAuth(),
  );
};

export const GetUserDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Single User',
      description: 'This endpoint gets a single user.',
    }),
    ApiResponse({
      description: 'Returns a user object',
      status: 200,
    }),
    ApiBearerAuth(),
  );
};

export const ResetLinkDoc = () => {
  return applyDecorators(
    ApiOperation({
      description:
        "This endpoint will send a password reset link to the user's email",
      summary: 'Reset Password Link',
    }),
    ApiResponse({
      status: 200,
      description: 'Please check Check your email for a password reset link',
    }),
  );
};

export const ResetPasswordDoc = () => {
  return applyDecorators(
    ApiOperation({
      description:
        'This endpoint will result when the user clicks on the rest password link.',
      summary: 'Reset Password Redirect',
    }),
    ApiResponse({
      status: 200,
      description: 'Will redirect the user to the rest password screen',
    }),
  );
};

export const ResetUserPasswordDoc = () => {
  return applyDecorators(
    ApiOperation({
      description: 'This endpoint will reset the users password.',
      summary: 'Reset Password',
    }),
    ApiBody({
      required: true,
      schema: j2s(ResetSchema).swagger,
    }),
    ApiResponse({
      status: 200,
      description: 'Password has been reset successfully',
    }),
  );
};

export const UploadProfileDoc = () => {
  return applyDecorators(
    ApiOperation({
      description: 'This endpoint will upload the user profile image.',
      summary: 'Upload Profile Image',
    }),
    ApiBody({
      required: true,
      type: 'Image',
    }),
    ApiResponse({
      status: 200,
      description: 'Image uploaded successfully',
    }),
  );
};
