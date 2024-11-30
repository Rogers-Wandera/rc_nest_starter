import { systemrolestype } from '../../../../coretoolkit/types/coretypes';
import * as Joi from 'joi';

export const SystemRolesSchema = Joi.object<systemrolestype>({
  rolename: Joi.string().min(3).max(250).required().messages({
    'any.required': 'rolename is required',
    'string.empty': 'rolename cannot be empty',
    'string.max': 'rolename must be at most {#limit} characters',
    'string.min': 'rolename must be at least {#limit} characters',
  }),
  value: Joi.number().required().messages({
    'any.required': 'value is required',
    'number.base': 'value must be a number',
  }),
  released: Joi.number().required().messages({
    'any.required': 'released is required',
    'number.base': 'released must be a number',
  }),
  description: Joi.string().min(3).max(250).required().messages({
    'any.required': 'description is required',
    'string.empty': 'description cannot be empty',
    'string.max': 'description must be at most {#limit} characters',
    'string.min': 'description must be at least {#limit} characters',
  }),
});
