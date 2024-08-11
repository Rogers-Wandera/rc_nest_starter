import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntityClass } from '../base.entity';
import { ServerRouteRole } from './serverrouteroles.entity';
import { METHODS } from '@toolkit/core-toolkit/types/enums/enums';

@Entity({
  name: 'serverroutemethods',
})
export class ServerRouteMethod extends BaseEntityClass {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => ServerRouteRole, (route) => route.servermethods, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'serverRouteId' })
  serverroute: ServerRouteRole;
  @Column('enum', { enum: METHODS })
  method: METHODS;
}
