import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
  Generated,
  ManyToOne,
} from 'typeorm';
import { Position } from './positions.entity';
import { Role } from './roles.entity';
import { Token } from './tokens.entity';
import { BaseEntityClass } from '../base.entity';
import { RefreshToken } from './refreshtokens.entity';
import { UserProfileImage } from './userprofileimages.entity';
import { TempRouteRole } from './temprouteroles.entity';
import { LinkRole } from './linkroles.entity';
import { RolePermission } from './rolepermissions.entity';
import { ServerRouteRole } from './serverrouteroles.entity';
@Entity({ name: 'users' })
export class User extends BaseEntityClass {
  @PrimaryColumn({ nullable: false, type: 'varchar', length: 100 })
  @Generated('uuid')
  id: string;
  @Column({ nullable: false })
  firstname: string;
  @Column({ nullable: false })
  lastname: string;
  @Column({ nullable: false })
  email: string;
  @Column({ nullable: false })
  password: string;
  @Column({ nullable: false })
  verified: number;
  @Column({ nullable: true, type: 'datetime' })
  lastloginDate: Date;
  @Column({ nullable: false, default: 0 })
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
  @OneToMany(() => Role, (role) => role.user)
  roles: Role[];
  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];
  @OneToOne(() => RefreshToken, (token) => token.user)
  refreshtoken: RefreshToken;
  @OneToOne(() => UserProfileImage, (image) => image.user)
  image: UserProfileImage;
  @OneToMany(() => TempRouteRole, (role) => role.user)
  temprouteRoles: TempRouteRole[];
  @OneToMany(() => LinkRole, (linkrole) => linkrole.User)
  LinkRoles: LinkRole[];
  @OneToMany(() => RolePermission, (role) => role.user)
  rolepermissions: RolePermission[];
  @OneToMany(() => ServerRouteRole, (role) => role.user)
  serverrouteroles: ServerRouteRole[];
}
