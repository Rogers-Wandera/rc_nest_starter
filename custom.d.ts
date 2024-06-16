import { reqUser } from 'src/services/core/auth/users/users.types';

declare global {
  namespace Express {
    interface Request {
      user: reqUser;
    }
  }
}
