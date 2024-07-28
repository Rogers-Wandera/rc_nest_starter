import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import {
  NOTIFICATION_STATUS,
  NOTIFICATION_TYPE,
  NotificationDeliveryTypes,
} from 'src/app/app.types';

@Entity({ name: 'notifications' })
export class Notification extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'enum', nullable: false, enum: NOTIFICATION_TYPE })
  type: NOTIFICATION_TYPE;
  @Column({ type: 'enum', nullable: false, enum: NOTIFICATION_STATUS })
  status: NOTIFICATION_STATUS;
  @Column({ type: 'int', nullable: false, default: 0 })
  recipientCount: number;
  @Column({ type: 'enum', nullable: false, enum: NotificationDeliveryTypes })
  deliveryType: NotificationDeliveryTypes;
}
