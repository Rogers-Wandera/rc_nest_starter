import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { User } from './users.entity';

@Entity({ name: 'positions' })
export class Position extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false })
  @Index()
  position: string;
  @OneToMany(() => User, (user) => user.position)
  users: User[];
}
