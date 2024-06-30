import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { User } from './users.entity';

@Entity({ name: 'temrouteroles' })
@Unique('UQ_TEMPROUTE', ['user', 'roleName', 'roleValue'])
export class TempRouteRole extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.temprouteRoles, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({ nullable: false })
  roleName: string;
  @Column({ nullable: false })
  roleValue: string;
  @Column({ nullable: false, type: 'varchar', length: 250 })
  description: string;
  @Column({ nullable: false, type: 'datetime' })
  expireTime: Date;
}
