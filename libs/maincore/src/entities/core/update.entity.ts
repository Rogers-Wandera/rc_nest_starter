import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('updates')
export class Updates {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false })
  entityName: string;
  @Column({ nullable: false })
  tableName: string;
  @Column({ nullable: false, type: 'json' })
  fromValue: string;
  @Column({ nullable: false, type: 'json' })
  toValue: string;
  @CreateDateColumn({ type: 'datetime' })
  creationDate: Date;
}
