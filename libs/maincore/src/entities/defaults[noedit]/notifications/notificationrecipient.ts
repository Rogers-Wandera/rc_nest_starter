import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntityClass } from '../../base.entity';
import { Notification } from './notification';
import {
  NOTIFICATION_STATUS,
  PRIORITY_TYPES,
} from '../../../coretoolkit/types/enums/enums';

@Entity({ name: 'notificationrecipients' })
export class NotificationRecipient extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false })
  recipient: string;
  @Column({ nullable: false })
  recipientHash: string;
  @ManyToOne(() => Notification, (notification) => notification.recipients, {
    nullable: false,
    eager: true,
  })
  @JoinColumn()
  notification: Notification;
  @Column({ type: 'enum', enum: PRIORITY_TYPES, nullable: false })
  priority: PRIORITY_TYPES;
  @Column({
    nullable: false,
    type: 'enum',
    enum: NOTIFICATION_STATUS,
    default: NOTIFICATION_STATUS.SENT,
  })
  status: NOTIFICATION_STATUS;
}
