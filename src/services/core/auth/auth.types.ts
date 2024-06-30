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
