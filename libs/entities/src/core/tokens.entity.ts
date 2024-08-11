import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './users.entity';
import { BaseEntityClass } from '../base.entity';
import { TOKEN_TYPES } from '@toolkit/core-toolkit/types/enums/enums';

@Entity({ name: 'tokens' })
export class Token extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.tokens, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({ nullable: false, type: 'text' })
  token: string;
  @Column({ nullable: false, type: 'enum', enum: TOKEN_TYPES })
  tokenType: TOKEN_TYPES;
  @Column({ nullable: false, type: 'datetime' })
  expire: Date;
}
