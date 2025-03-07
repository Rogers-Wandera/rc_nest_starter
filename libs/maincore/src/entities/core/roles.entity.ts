import {
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './users.entity';
import { Systemrole } from './systemroles.entity';
import { BaseEntityClass } from '../base.entity';

@Entity({ name: 'roles' })
@Unique('UQ_ROLES', ['user', 'systemRole'])
export class Role extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.roles, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;
  @ManyToOne(() => Systemrole, (role) => role.roles, { nullable: false })
  @JoinColumn({ name: 'roleId' })
  systemRole: Systemrole;
}
