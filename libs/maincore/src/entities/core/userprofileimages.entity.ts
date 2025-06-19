import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { User } from './users.entity';

@Entity({ name: 'userprofileimages' })
export class UserProfileImage extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, type: 'text' })
  image: string;
  @OneToOne(() => User, (user) => user.image, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({ nullable: false })
  @Index()
  public_id: string;
}
