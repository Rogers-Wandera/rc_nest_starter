import {
  Column,
  Entity,
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
  @OneToOne(() => User, (user) => user.image)
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({ nullable: false })
  public_id: string;
}
