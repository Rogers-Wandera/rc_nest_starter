import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Position } from './positions.entity';
import { Role } from './roles.entity';
import { Token } from './tokens.entity';
import { BaseEntityClass } from '../base.entity';
import { RefreshToken } from './refreshtokens.entity';
import { UserProfileImage } from './userprofileimages.entity';
import { LinkRole } from './linkroles.entity';
import { UserGroupMember } from './usergroupmembers.entity';
import { UserGroupSupervisors } from './usergroupsupervisors.entity';

@Entity({ name: 'users' })
export class User extends BaseEntityClass<string> {
  @PrimaryColumn({ nullable: false, type: 'varchar', length: 100 })
  id: string;
  @Column({ nullable: false })
  @Index()
  firstname: string;
  @Column({ nullable: false })
  @Index()
  lastname: string;
  @Column({ nullable: false })
  @Index()
  email: string;
  @Column({ nullable: false })
  password: string;
  @Column({ nullable: false })
  @Index()
  verified: number;
  @Column({ nullable: true, type: 'datetime' })
  lastloginDate: Date;
  @Column({ nullable: false, default: 0 })
  @Index()
  isLocked: number;
  @Column({ nullable: false, default: 0 })
  adminCreated: number;
  @Column({ nullable: false })
  gender: string;
  @Column({ nullable: false })
  tel: string;
  @ManyToOne(() => Position, (position) => position.users, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'positionId' })
  position: Position;
  @Column({ nullable: false, default: 0 })
  online: number;
  @OneToMany(() => Role, (role) => role.user, { eager: true })
  roles: Role[];
  @OneToMany(() => Token, (token) => token.user, { eager: true })
  tokens: Token[];
  @OneToOne(() => RefreshToken, (token) => token.user)
  refreshtoken: RefreshToken;
  @OneToOne(() => UserProfileImage, (image) => image.user)
  image: UserProfileImage;
  @OneToMany(() => LinkRole, (linkrole) => linkrole.User)
  LinkRoles: LinkRole[];
  @OneToMany(() => UserGroupMember, (group) => group.user)
  usergroups: UserGroupMember[];
  @OneToMany(() => UserGroupSupervisors, (group) => group.user)
  supervisor: UserGroupSupervisors[];
}
