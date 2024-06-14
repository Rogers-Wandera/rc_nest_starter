import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityClass } from '../base.entity';
@Entity()
export class Recyclebin extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false })
  original_table_name: string;
  @Column({ nullable: false })
  original_record_id: string;
}
