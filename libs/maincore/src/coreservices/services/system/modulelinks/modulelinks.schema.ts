import { Modulelinksschematype } from '../../../../coretoolkit/types/coretypes';
import * as Joi from 'joi';

export const modulelinksschema = Joi.object<Modulelinksschematype>({
  linkname: Joi.string().required().min(3).max(30).messages({
    'string.empty': 'Link name is required',
    'any.required': 'Link name is required',
    'string.alphanum': 'Link name must contain only alphanumeric characters',
    'string.min': 'Link name must be at least {#limit} characters',
    'string.max': 'Link name must be at most {#limit} characters',
  }),
  position: Joi.number().optional().messages({
    'number.base': 'Position must be a number',
  }),
  route: Joi.string().required().min(3).max(200).messages({
    'string.empty': 'Route is required',
    'any.required': 'Route is required',
    'string.min': 'Route must be at least {#limit} characters',
    'string.max': 'Route must be at most {#limit} characters',
  }),
  released: Joi.number().optional().messages({
    'number.base': 'Released must be a number',
  }),
  render: Joi.number().optional().messages({
    'any.required': 'Render is required',
    'number.base': 'Render must be a number',
  }),
  default: Joi.number().optional().messages({
    'any.required': 'Default is required',
    'number.base': 'Default must be a number',
  }),
});
