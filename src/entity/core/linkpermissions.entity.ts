import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { ModuleLink } from './modulelinks.entity';

enum METHODS {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  PUT = 'PUT',
  OPTIONS = 'OPTIONS',
}
@Entity({
  name: 'linkpermissions',
})
@Unique('UQ_permission', ['ModuleLink', 'accessName'])
export class LinkPermission extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => ModuleLink, (modulelink) => modulelink)
  @JoinColumn({ name: 'moduleLinkId' })
  ModuleLink: ModuleLink;
  @Column({ nullable: false, length: 20 })
  accessName: string;
  @Column({ nullable: false, length: 50 })
  accessRoute: string;
  @Column('enum', { nullable: false, enum: METHODS })
  method: METHODS;
  @Column({ nullable: false })
  description: string;
}
