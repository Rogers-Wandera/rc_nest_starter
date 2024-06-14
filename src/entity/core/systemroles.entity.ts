import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { Role } from './roles.entity';

@Entity({ name: 'systemroles' })
export class Systemrole extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false })
  rolename: string;
  @Column({ nullable: false })
  value: number;
  @Column({ nullable: false, width: 1, default: 0 })
  released: number;
  @Column({ nullable: false, type: 'text' })
  description: string;
  @OneToMany(() => Role, (role) => role.systemRole)
  roles: Role[];
}
