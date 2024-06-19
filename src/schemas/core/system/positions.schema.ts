import Joi from 'joi';
import { Position } from 'src/entity/core/positions.entity';

export const PositionsSchema = Joi.object<Partial<Position>>({
  position: Joi.string().min(3).max(200).required().messages({
    'any.required': 'Position is required',
    'string.empty': 'Position cannot be empty',
    'string.max': 'Position must be at most {#limit} characters',
    'string.min': 'Position must be at least {#limit} characters',
  }),
});
