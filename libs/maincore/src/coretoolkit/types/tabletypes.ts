import { columntypes } from './coretypes';

export type TableColumnTypes = {
  accessorKey: string;
  header: string;
  type?: columntypes;
  visible?: boolean;
};
