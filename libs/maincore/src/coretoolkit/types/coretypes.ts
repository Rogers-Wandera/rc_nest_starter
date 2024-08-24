import { User } from '../../entities/core/users.entity';
import { permissiontype } from '../decorators/permissions.decorator';
import { ModuleLink } from '../../entities/core/modulelinks.entity';
import { ApiProperty } from '@nestjs/swagger';
import { METHODS } from './enums/enums';
import { FindOptionsWhere } from 'typeorm';

export type Constructor<T> = new (...args: unknown[]) => T;

export type Paramstype = 'body' | 'params' | 'query';
export type rolestype = 'ADMIN' | 'USER' | 'PROGRAMMER' | 'EDITOR';
export type decrypttype = {
  type: Paramstype;
  keys: string[];
  decrypttype?: 'uri' | 'other';
};

export type paginateprops<T> = {
  limit: number;
  page: number;
  sortBy: { id: keyof T; desc?: boolean }[];
  conditions?: FindOptionsWhere<T> | null;
  filters?: { id: keyof T; value: string }[];
  globalFilter?: string | null;
};

export type systemrolestype = {
  rolename: string;
  value: number;
  description: string;
  released: number;
};

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

export type PermissionRouteType = {
  permission: permissiontype;
  dashboardRoute: string;
  routes: { method: METHODS; route: string; name: string }[];
};

export type registertype = Partial<User> & {
  confirmpassword: string;
  adminCreated: number;
  positionId: number;
};

export type resetpasswordtype = {
  confirmpassword: string;
  password: string;
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
  // serverroles: ServerRolesType[];
};

export type TokenUser = {
  sub: string;
  user: reqUser;
};

export type ModulesSchemaType = {
  name: string;
  position?: number;
};

export type SYSTEM_ROLES = {
  [k in rolestype]: number;
};

export type customquerypaginateprops<T> = {
  query: string;
  queryParams: (string | number)[];
  limit: number;
  page: number;
  sortBy: { id: keyof T; desc?: boolean }[];
  filters?: { id: keyof T; value: string }[];
  globalFilter?: string | null;
};

export interface PaginationResults<T> {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class PaginateDTO<T> {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  docs: T[];

  @ApiProperty()
  totalDocs: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPrevPage: boolean;
}

export class paginatepropsDto<T> {
  @ApiProperty()
  limit: number;
  @ApiProperty()
  page: number;
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  sortBy: { id: keyof T; desc?: boolean }[];
  @ApiProperty({ required: false })
  conditions?: Partial<T> | null;
  @ApiProperty({ required: false })
  filters?: { id: keyof T; value: string }[];
  @ApiProperty({ required: false })
  globalFilter?: string | null;
}

export type Modulelinksschematype = Partial<ModuleLink>;

export type SingleUploadType = {
  type: 'single';
  source: 'image' | 'audio' | 'video' | 'file';
  maxSize?: number;
};
export type MultipleUploadType = {
  type: 'multiple';
  source: 'image' | 'audio' | 'video' | 'file';
  fileCount?: number;
  maxSize?: number;
};
export type FileUploadType = SingleUploadType | MultipleUploadType;

export type ClassValidatorType = {
  classDTO: Constructor<any>;
  type?: Paramstype;
};

export type columntypes =
  | 'text'
  | 'autocomplete'
  | 'checkbox'
  | 'date'
  | 'date-range'
  | 'datetime'
  | 'datetime-range'
  | 'multi-select'
  | 'range'
  | 'range-slider'
  | 'select'
  | 'time'
  | 'time-range';
export type ColumnConfigTypes = {
  name: string;
  type?: columntypes;
  visible?: true | false;
};
