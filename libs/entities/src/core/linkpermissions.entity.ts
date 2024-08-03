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
import { ModuleLink } from './modulelinks.entity';
import { RolePermission } from './rolepermissions.entity';
import { METHODS } from '@toolkit/core-toolkit/types/enums/enums';

@Entity({
  name: 'linkpermissions',
})
@Unique('UQ_permission', ['ModuleLink', 'accessName'])
export class LinkPermission extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => ModuleLink, (modulelink) => modulelink, {
    nullable: false,
    eager: true,
  })
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
  @OneToMany(() => RolePermission, (role) => role.linkpermission)
  rolepermissions: RolePermission[];
}
