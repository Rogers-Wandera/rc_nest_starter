import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { NotificationBody } from './notificationbody.entity';
import { MediaTypes } from 'src/app/patterns/notification.patterns';

@Entity({ name: 'notificationmedias' })
export class NotificationMedia extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => NotificationBody, (body) => body.media, {
    nullable: false,
  })
  @JoinColumn({ name: 'bodyId' })
  body: NotificationBody;
  @Column({ nullable: false, type: 'varchar', length: 200 })
  url: string;
  @Column({ nullable: false, type: 'enum', enum: MediaTypes })
  type: MediaTypes;
}
