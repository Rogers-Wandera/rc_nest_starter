import joi from 'joi';
import { LinkPermission } from 'src/entity/core/linkpermissions.entity';

export const PermissionSchema = joi.object<Partial<LinkPermission>>({
  accessName: joi.string().min(3).max(250).required().messages({
    'any.required': 'Access Name is required',
    'string.empty': 'Access Name cannot be empty',
    'string.max': 'Access Name must be at most {#limit} characters',
    'string.min': 'Access Name must be at least {#limit} characters',
  }),
  accessRoute: joi.string().min(3).max(250).required().messages({
    'any.required': 'Access Route is required',
    'string.empty': 'Access Route cannot be empty',
    'string.max': 'Access Route must be at most {#limit} characters',
    'string.min': 'Access Route must be at least {#limit} characters',
  }),
  method: joi
    .string()
    .valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')
    .required()
    .messages({
      'any.required': 'Method is required',
      'string.empty': 'Method cannot be empty',
      'any.only':
        'Method must be one of GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
    }),
  description: joi.string().min(3).max(250).required().messages({
    'any.required': 'Description is required',
    'string.empty': 'Description cannot be empty',
    'string.max': 'Description must be at most {#limit} characters',
    'string.min': 'Description must be at least {#limit} characters',
  }),
});
