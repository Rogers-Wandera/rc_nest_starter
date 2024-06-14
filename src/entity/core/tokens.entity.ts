import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './users.entity';
import { BaseEntityClass } from '../base.entity';

@Entity({ name: 'tokens' })
export class Token extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.tokens)
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({ nullable: false, type: 'text' })
  token: string;
  @Column({ nullable: false, type: 'datetime' })
  expire: Date;
}
