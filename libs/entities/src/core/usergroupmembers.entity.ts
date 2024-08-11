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

@Entity({ name: 'usergroupmembers' })
@Unique('UQ_USERGROUPMEMBERS', ['group', 'user'])
export class UserGroupMember extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: string;
  @ManyToOne(() => UserGroup, (group) => group.members, {
    nullable: false,
  })
  group: UserGroup;
  @ManyToOne(() => User, (user) => user.usergroups, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;
}
