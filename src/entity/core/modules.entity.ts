import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { ModuleLink } from './modulelinks.entity';

@Entity({ name: 'modules' })
@Unique('UQ_NAME', ['name'])
export class Module extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false })
  name: string;
  @Column({ nullable: false })
  position: number;
  @OneToMany(() => ModuleLink, (moduleLink) => moduleLink.module)
  modulelinks: ModuleLink[];
}
