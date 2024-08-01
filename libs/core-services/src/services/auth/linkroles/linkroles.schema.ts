import Joi from 'joi';
import JoiDate from '@joi/date';

const joi = Joi.extend(JoiDate);

export const linkrolesSchema = joi.object({
  linkId: joi.number().required().messages({
    'any.required': 'linkId is required',
    'number.base': 'linkId must be a number',
  }),
  userId: joi.string().min(3).max(200).required().messages({
    'any.required': 'userId is required',
    'string.empty': 'userId cannot be empty',
    'string.max': 'userId must be at most {#limit} characters',
    'string.min': 'userId must be at least {#limit} characters',
  }),
  expireDate: joi
    .date()
    .required()
    .format('YYYY-MM-DD HH:mm')
    .min('now')
    .allow(null)
    .messages({
      'date.format': 'Expire Date must be in format YYYY-MM-DD HH:mm',
      'date.base': 'Expire Date must be a valid date',
      'date.min': 'Expire Date must be greater than or equal to now',
    }),
});

export const updatelinkSchema = joi.object({
  expireDate: joi
    .date()
    .required()
    .format('YYYY-MM-DD HH:mm')
    .min('now')
    .allow(null)
    .messages({
      'date.format': 'Expire Date must be in format YYYY-MM-DD HH:mm',
      'date.base': 'Expire Date must be a valid date',
      'date.min': 'Expire Date must be greater than or equal to now',
    }),
});
