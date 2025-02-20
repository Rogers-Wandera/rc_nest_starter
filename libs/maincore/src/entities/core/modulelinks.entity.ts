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
import { LinkRole } from './linkroles.entity';

@Entity({ name: 'modulelinks' })
@Unique('UQ_moduleId_linkname', ['module', 'linkname'])
export class ModuleLink extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Module, (module) => module.modulelinks, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'moduleId' })
  module: Module;
  @Column({ nullable: false })
  linkname: string;
  @Column({ nullable: false, default: 0 })
  default: number;
  @Column({ nullable: false })
  route: string;
  @Column({ nullable: false })
  position: number;
  @Column({ nullable: false, default: 1, type: 'int' })
  render: number;
  @Column({ nullable: false, default: 0, type: 'int' })
  released: number;
  @OneToMany(
    () => LinkPermission,
    (linkpermission) => linkpermission.ModuleLink,
  )
  LinkPermissions: LinkPermission[];
  @OneToMany(() => LinkRole, (linkrole) => linkrole.ModuleLink)
  LinkRoles: LinkRole[];
}
