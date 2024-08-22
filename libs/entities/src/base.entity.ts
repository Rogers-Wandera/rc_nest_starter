import { applyDecorators } from '@nestjs/common';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

type PrimaryKeyType<T> = T extends string
  ? typeof PrimaryColumn
  : typeof PrimaryGeneratedColumn;

export abstract class BaseEntityClass<T extends string | number = number> {
  abstract id: T;
  @CreateDateColumn({
    type: 'datetime',
  })
  creationDate: Date;
  @Column({ nullable: false })
  createdBy: string;
  @UpdateDateColumn({
    type: 'datetime',
  })
  updateDate: Date;
  @Column({ nullable: true })
  updatedBy: string;
  @DeleteDateColumn({
    type: 'datetime',
    name: 'deleted_at',
  })
  deletedAt: Date;
  @Column({ nullable: true })
  deletedBy: string;
  @Column({ default: 1, type: 'int', width: 1 })
  isActive: number;
}
