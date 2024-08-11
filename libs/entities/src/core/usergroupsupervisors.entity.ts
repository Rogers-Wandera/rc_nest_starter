import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { User } from './users.entity';
import { UserGroup } from './usergroups.entity';

@Entity({ name: 'usergroupsupervisors' })
@Unique('UQ_GROUPSUPERVISOR', ['user', 'group'])
export class UserGroupSupervisors extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.supervisor)
  @JoinColumn()
  user: User;
  @ManyToOne(() => UserGroup, (group) => group.supervisor)
  @JoinColumn()
  group: UserGroup;
}
