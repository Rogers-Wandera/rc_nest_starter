import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { BaseEntityClass } from '../../base.entity';
import {
  NOTIFICATION_PATTERN,
  NotificationTypes,
  PRIORITY_TYPES,
} from '../../../coretoolkit/types/enums/enums';
import { NotificationBody } from './notificationbody';
import {
  NOTIFICATION_STATUS,
  NOTIFICATION_TYPE,
  NotificationDeliveryTypes,
} from '../../../coretoolkit/types/enums/enums';
import { NotificationRecipient } from './notificationrecipient';

@Entity({ name: 'notifications' })
export class Notification extends BaseEntityClass<string> {
  @PrimaryColumn()
  id: string;
  @Column({ type: 'enum', nullable: false, enum: NOTIFICATION_TYPE })
  type: NOTIFICATION_TYPE;
  @Column({ type: 'enum', nullable: false, enum: NOTIFICATION_STATUS })
  status: NOTIFICATION_STATUS;
  @Column({ type: 'int', nullable: false, default: 0 })
  recipientCount: number;
  @Column({
    type: 'enum',
    enum: NotificationTypes,
    nullable: false,
    default: NotificationTypes.CUSTOM,
  })
  notificationType: NotificationTypes;
  @Column({
    type: 'enum',
    nullable: false,
    enum: NotificationDeliveryTypes,
    default: NotificationDeliveryTypes.SMS_DELIVERY,
  })
  deliveryType: NotificationDeliveryTypes;
  @Column({ type: 'enum', enum: PRIORITY_TYPES, nullable: false })
  priority: PRIORITY_TYPES;
  @Column({ type: 'varchar', length: 150, nullable: true })
  link: string;
  @Column({ type: 'varchar', length: 50, nullable: false })
  pattern: NOTIFICATION_PATTERN;
  @Column({ type: 'enum', enum: NOTIFICATION_PATTERN, nullable: false })
  command: NOTIFICATION_PATTERN;
  @OneToOne(() => NotificationBody, (body) => body.notification, {
    eager: true,
  })
  body: NotificationBody;
  @OneToMany(
    () => NotificationRecipient,
    (recipients) => recipients.notification,
  )
  recipients: NotificationRecipient[];
}
