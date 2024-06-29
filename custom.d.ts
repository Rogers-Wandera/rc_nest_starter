import { reqUser } from 'src/services/core/auth/users/users.types';
import { EntityTarget, ObjectLiteral } from 'typeorm';

declare global {
  namespace Express {
    interface Request {
      user: reqUser;
      entities: { [key: string]: EntityTarget };
    }
  }
}
