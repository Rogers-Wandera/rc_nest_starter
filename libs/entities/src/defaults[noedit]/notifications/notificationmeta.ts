import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntityClass } from '../../base.entity';
import { NotificationBody } from './notificationbody';

@Entity({ name: 'notificationmetas' })
export class NotificationMeta extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => NotificationBody, (body) => body.meta, {
    nullable: false,
  })
  @JoinColumn({ name: 'bodyId' })
  body: NotificationBody;
  @Column({ nullable: false, type: 'varchar', length: 100 })
  name: string;
  @Column({ nullable: false, type: 'text' })
  value: string | number | Boolean | Date;
}
