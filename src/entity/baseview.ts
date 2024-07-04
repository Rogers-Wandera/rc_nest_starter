import { ViewColumn } from 'typeorm';

export abstract class BaseEntityView {
  @ViewColumn()
  creationDate: Date;
  @ViewColumn()
  createdBy: string;
  @ViewColumn()
  updatedBy: string;
  @ViewColumn()
  updateDate: Date;
  @ViewColumn()
  deleted_at: Date;
  @ViewColumn()
  deletedBy: string;
  @ViewColumn()
  isActive: number;
}
