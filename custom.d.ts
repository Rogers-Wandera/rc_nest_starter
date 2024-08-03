import { reqUser } from '@toolkit/core-toolkit/types/coretypes';
import { EntityTarget, ObjectLiteral } from 'typeorm';

declare global {
  namespace Express {
    interface Request {
      user: reqUser;
      entities: { [key: string]: EntityTarget };
    }
  }
}
