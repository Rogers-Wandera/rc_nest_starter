import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { Module } from './modules.entity';
import { LinkPermission } from './linkpermissions.entity';

@Entity({ name: 'modulelinks' })
@Unique('UQ_moduleId_linkname', ['module', 'linkname'])
export class ModuleLink extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Module, (module) => module.modulelinks)
  @JoinColumn({ name: 'moduleId' })
  module: Module;
  @Column({ nullable: false })
  linkname: string;
  @Column({ nullable: false })
  route: string;
  @Column({ nullable: false })
  position: number;
  @Column({ nullable: false, enum: [0, 1], default: 1, type: 'enum' })
  render: number;
  @Column({ nullable: false, enum: [0, 1], default: 0, type: 'enum' })
  released: number;
  @OneToMany(
    () => LinkPermission,
    (linkpermission) => linkpermission.ModuleLink,
  )
  LinkPermissions: LinkPermission[];
}
