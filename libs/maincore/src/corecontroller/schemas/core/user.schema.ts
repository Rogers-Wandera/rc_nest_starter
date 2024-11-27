import {
  addrolestype,
  registertype,
  resetpasswordtype,
} from '../../../coretoolkit/types/coretypes';
import Joi from 'joi';

const prefixes = ['+256', '+254', '+255'];
export const nameRegex = /^[a-zA-Z\s]+$/;

const customValidation = (
  value: string,
  helpers: Joi.CustomHelpers<string>,
) => {
  if (typeof value !== 'string') {
    return helpers.message({ custom: 'Password must be a string' });
  }
  const startsWithPrefix = prefixes.some((prefix) => value.startsWith(prefix));
  if (!startsWithPrefix) {
    return helpers.message({
      custom: 'Invalid phone number prefix accepted are ' + prefixes.join(','),
    });
  }
  return value;
};

const UserRegisterSchema = Joi.object<registertype>({
  firstname: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required',
    'string.alphanum':
      'First name must contain only alphabet characters e.g(A-Z)',
    'string.min': 'First name must be at least {#limit} characters',
    'string.max': 'First name must be at most {#limit} characters',
  }),
  lastname: Joi.string().regex(nameRegex).min(3).max(30).required().messages({
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required',
    'string.pattern.base': 'Last name must only contain letters and spaces.',
    'string.min': 'Last name must be at least 3 characters long.',
    'string.max': 'Last name must be at most 30 characters long.',
  }),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required()
    .messages({
      'string.email': 'Invalid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email is required',
    }),
  adminCreated: Joi.alternatives().try(
    Joi.number().required().messages({
      'number.base': 'Admin created must be a number',
      'any.required': 'Admin created is required',
    }),
    Joi.allow(null).messages({
      'any.allowOnly': 'Admin created is required',
      'any.required': 'Admin created is required',
    }),
  ),
  gender: Joi.string().valid('Male', 'Female').required().messages({
    'string.empty': 'Gender cannot be empty',
    'any.required': 'Gender is required',
    'any.only': 'Gender must be Male or Female',
  }),
  tel: Joi.string()
    .required()
    .custom((value, helper) => customValidation(value, helper))
    .length(13)
    .messages({
      'string.empty': 'Telephone number cannot be empty',
      'string.base': 'Telephone number must be a string',
      'string.length': 'Telephone number must be 13 characters',
      'any.required': 'Telephone number is required',
    }),
  positionId: Joi.number().required().positive().messages({
    'any.required': 'Position is required.',
    'number.base': 'Position must be a number',
    'number.positive': 'Position must be greater than or equal to 1',
  }),
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[a-zA-Z\d]).{6,}$/))
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
      'string.pattern.base':
        'Password must be at least 6 characters long containing at least one letter and one number',
    }),
  confirmpassword: Joi.valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords must match',
    'any.required': 'Password confirmation is required',
  }),
});

const LoginSchema = Joi.object<registertype>({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required()
    .messages({
      'string.email': 'Invalid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email is required',
    }),
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[a-zA-Z\d]).{6,}$/))
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
      'string.pattern.base':
        'Password must be at least 6 characters long containing at least one letter and one number',
    }),
});

const AddRoleSchema = Joi.object<addrolestype>({
  roleId: Joi.number().positive().required().messages({
    'string.empty': 'Role is required',
    'any.required': 'Role is required',
  }),
  userId: Joi.string().required().messages({
    'string.empty': 'User id is required',
    'any.required': 'User id is required',
  }),
});

const ResetSchema = Joi.object<resetpasswordtype>({
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[a-zA-Z\d]).{6,}$/))
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
      'string.pattern.base':
        'Password must be at least 6 characters long containing at least one letter and one number',
    }),
  confirmpassword: Joi.valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords must match',
    'any.required': 'Password confirmation is required',
  }),
});

const ResetLinkSchema = Joi.object<registertype>({
  email: Joi.alternatives(
    Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
      .required()
      .messages({
        'string.email': 'Invalid email address',
        'any.required': 'Email is required',
        'string.empty': 'Email is required',
      }),
    Joi.allow(null).messages({
      'any.allowOnly': 'Admin created is required',
      'any.required': 'Admin created is required',
    }),
  ),
}).unknown(true);

export {
  UserRegisterSchema,
  LoginSchema,
  AddRoleSchema,
  ResetSchema,
  ResetLinkSchema,
};
