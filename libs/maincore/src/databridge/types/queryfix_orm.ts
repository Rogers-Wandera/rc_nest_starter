import { ObjectLiteral } from 'typeorm';

export type QueryDeepPartial<T extends ObjectLiteral> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<QueryDeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<QueryDeepPartial<U>>
      : QueryDeepPartial<T[P]> | (() => string);
};
