import { from } from 'rxjs';
import { paginateprops } from '../../../coretoolkit/types/coretypes';
import * as Joi from 'joi';

export const generateDynamicConditionsSchema = (itemSchema: {
  [key: string]: any;
}) => {
  const schema: { [key: string]: Joi.Schema } = {};

  for (const key in itemSchema) {
    switch (typeof itemSchema[key]) {
      case 'string':
        schema[key] = Joi.string();
        break;
      case 'number':
        schema[key] = Joi.number();
        break;
      case 'boolean':
        schema[key] = Joi.boolean();
        break;
      // Add more cases as needed
      default:
        schema[key] = Joi.any();
        break;
    }
  }

  return Joi.object(schema).unknown(true); // Allow other properties as well
};

type paginatePropsWithDateFilter<T> = paginateprops<T> & {
  dateFilter: {
    from?: Date;
    to?: Date;
  };
};

export const PaginationSchema = <T>(itemSchema: {
  [key: string]: any;
}): Joi.ObjectSchema<paginatePropsWithDateFilter<T>> => {
  const conditionsSchema = generateDynamicConditionsSchema(itemSchema);
  return Joi.object<paginatePropsWithDateFilter<T>>({
    limit: Joi.number().integer().required().messages({
      'number.base': `limit should be a type of 'number'`,
      'number.integer': `limit should be an integer`,
      'any.required': `limit is a required field`,
    }),
    page: Joi.number().integer().required().messages({
      'number.base': `page should be a type of 'number'`,
      'number.integer': `page should be an integer`,
      'any.required': `page is a required field`,
    }),
    sortBy: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required().messages({
            'string.base': `"sortBy.id" should be a type of 'text'`,
            'any.required': `"sortBy.id" is a required field`,
          }),
          desc: Joi.boolean().optional().messages({
            'boolean.base': `"sortBy.desc" should be a type of 'boolean'`,
          }),
        }).required(),
      )
      .empty(Joi.array().length(0))
      .optional()
      .messages({
        'array.base': `sortBy should be an array`,
        'any.required': `sortBy is a required field`,
      }),
    conditions: Joi.alternatives().try(conditionsSchema).optional(),
    filters: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required().messages({
            'string.base': `"filters.id" should be a type of 'text'`,
            'any.required': `"filters.id" is a required field`,
          }),
          value: Joi.string().required().messages({
            'string.base': `"filters.value" should be a type of 'text'`,
            'any.required': `"filters.value" is a required field`,
          }),
        }).optional(),
      )
      .optional()
      .messages({
        'array.base': `"filters" should be an array`,
        'any.required': `"filters" is a required field`,
      }),
    globalFilter: Joi.string().allow(null, '').optional().messages({
      'string.base': `"globalFilter" should be a type of 'text'`,
    }),
    dateFilter: Joi.object({
      from: Joi.date().allow(null, '').optional().messages({
        'date.base': `"dateFilter.from" should be a type of 'date'`,
      }),
      to: Joi.date().allow(null, '').optional().messages({
        'date.base': `"dateFilter.to" should be a type of 'date'`,
      }),
    }).optional(),
  });
};

export type paginateschematype = typeof PaginationSchema;
