import { ApiProperty } from '@nestjs/swagger';

export type paginateprops<T> = {
  limit: number;
  page: number;
  sortBy: { id: keyof T; desc?: boolean }[];
  conditions?: Partial<T> | null;
  filters?: { id: keyof T; value: string }[];
  globalFilter?: string | null;
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
