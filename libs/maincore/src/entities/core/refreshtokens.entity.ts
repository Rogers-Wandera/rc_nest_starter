import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { User } from './users.entity';

@Entity({ name: 'refreshtokens' })
export class RefreshToken extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => User, (user) => user.refreshtoken, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({ nullable: false, type: 'text' })
  token: string;
}
