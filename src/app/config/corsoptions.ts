import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { allowedOrigins } from './allowedorigins';
import { BadRequestException } from '@nestjs/common';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException(
          'Not allowed to access the server contact admin',
        ),
      );
    }
  },
  optionsSuccessStatus: 200,
};
