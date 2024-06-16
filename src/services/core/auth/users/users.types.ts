import { User } from 'src/entity/core/users.entity';

export type registertype = Partial<User> & {
  confirmpassword: string;
  adminCreated: number;
  positionId: number;
};

export type addrolestype = {
  userId: string;
  roleId: number;
};

export type reqUser = {
  displayName: string;
  roles: number[];
  id: string;
  isLocked: number;
  verified: number;
  adminCreated: number;
  position: string;
  image: string;
};

export type TokenUser = {
  sub: string;
  user: reqUser;
};
