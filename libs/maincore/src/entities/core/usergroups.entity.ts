import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { UserGroupStatus } from '../../coretoolkit/types/enums/enums';
import { UserGroupMember } from './usergroupmembers.entity';
import { UserGroupSupervisors } from './usergroupsupervisors.entity';

@Entity({ name: 'usergroups' })
@Unique('UQ_GROUPNAME', ['groupName'])
export class UserGroup extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, type: 'varchar', length: 40 })
  groupName: string;
  @Column({
    nullable: false,
    type: 'enum',
    enum: UserGroupStatus,
    default: UserGroupStatus.ACTIVE,
  })
  status: UserGroupStatus;
  @Column({ type: 'text' })
  description: string;
  @OneToMany(() => UserGroupMember, (group) => group.group)
  members: UserGroupMember[];
  @OneToMany(() => UserGroupSupervisors, (supervisor) => supervisor.group)
  supervisor: UserGroupSupervisors[];
}
