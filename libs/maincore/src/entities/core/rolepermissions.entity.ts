import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { LinkPermission } from './linkpermissions.entity';
import { LinkRole } from './linkroles.entity';
import { ServerRouteRole } from './serverrouteroles.entity';

@Entity({
  name: 'rolepermissions',
})
@Unique('UQ_ROLE', ['linkpermission', 'linkrole'])
export class RolePermission extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => LinkPermission, (link) => link.rolepermissions, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'permissionId' })
  linkpermission: LinkPermission;
  @ManyToOne(() => LinkRole, (role) => role.rolepermissions, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'roleId' })
  linkrole: LinkRole;
  @OneToMany(() => ServerRouteRole, (role) => role.rolepermission)
  serverrouteroles: ServerRouteRole[];
}
