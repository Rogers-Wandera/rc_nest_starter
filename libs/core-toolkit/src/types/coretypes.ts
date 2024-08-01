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
  conditions?: Partial<T> | null;
  filters?: { id: keyof T; value: string }[];
  globalFilter?: string | null;
};
