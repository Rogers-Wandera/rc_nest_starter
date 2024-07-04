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
import { User } from './users.entity';
import { RolePermission } from './rolepermissions.entity';

@Entity({
  name: 'linkroles',
})
@Unique('UQ_Role_User', ['User', 'ModuleLink'])
export class LinkRole extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => ModuleLink, (link) => link.LinkRoles, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'moduleLinkId' })
  ModuleLink: ModuleLink;
  @ManyToOne(() => User, (user) => user.LinkRoles, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'userId' })
  User: User;
  @Column({ type: 'datetime', nullable: true })
  expireDate: Date;
  @OneToMany(() => RolePermission, (role) => role.linkrole)
  rolepermissions: RolePermission[];
}
