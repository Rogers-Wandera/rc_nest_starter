export type systemrolestype = {
  rolename: string;
  value: number;
  description: string;
  released: number;
};

export enum METHODS {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  PUT = 'PUT',
  OPTIONS = 'OPTIONS',
}

export type UserModuleRes = {
  [key: string]: {
    name: string;
    linkname: string;
    route: string;
    expired: number;
    render: number;
  }[];
};

export type ServerRolesType = {
  roleName: string;
  roleValue: string;
  userId: string;
  expired: number;
  days_left: number;
  method: METHODS;
};
