import Joi from 'joi';
import { nameRegex } from '../../../../corecontroller/schemas/core/user.schema';
import { ModulesSchemaType } from '../../../../coretoolkit/types/coretypes';

const ModulesSchema = Joi.object<ModulesSchemaType>({
  name: Joi.string().regex(nameRegex).min(3).max(30).required().messages({
    'string.empty': 'Module name is required',
    'any.required': 'Module name is required',
    'string.pattern.base': 'Module name must only contain letters and spaces.',
    'string.min': 'Module name must be at least 3 characters long.',
    'string.max': 'Module name must be at most 30 characters long.',
  }),
  position: Joi.number().positive().optional().messages({
    'string.empty': 'Position is required',
    'any.required': 'Position is required',
    'number.base': 'Position should be a number',
  }),
});

export { ModulesSchema };
