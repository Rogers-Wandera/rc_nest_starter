import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { ServerRouteMethod } from './serverroutemethods.entity';
import { RolePermission } from './rolepermissions.entity';

@Entity({
  name: 'serverrouteroles',
})
export class ServerRouteRole extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false })
  roleName: string;
  @Column({ nullable: false })
  roleValue: string;
  @Column({ nullable: false })
  description: string;
  @Column({ nullable: true, type: 'datetime' })
  expireTime: Date;
  @ManyToOne(() => RolePermission, (role) => role.serverrouteroles, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn({ name: 'permissionId' })
  rolepermission: RolePermission;
  @OneToMany(() => ServerRouteMethod, (route) => route.serverroute)
  servermethods: ServerRouteMethod[];
}
