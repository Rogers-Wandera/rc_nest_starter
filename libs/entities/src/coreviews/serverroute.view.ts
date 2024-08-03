import { ViewColumn, ViewEntity } from 'typeorm';
import { ServerRouteMethod } from '../core/serverroutemethods.entity';
import { ServerRouteRole } from '../core/serverrouteroles.entity';
import { User } from '../core/users.entity';
import { BaseEntityView } from '../baseview';
import { METHODS } from '@toolkit/core-toolkit/types/enums/enums';

@ViewEntity({
  name: 'vw_serverroles',
  expression: (model) =>
    model
      .createQueryBuilder()
      .select('srm.*')
      .from(ServerRouteMethod, 'srm')
      .withDeleted()
      .addSelect(
        'srr.roleName as roleName, srr.roleValue as roleValue, srr.description as description',
      )
      .addSelect(
        'srr.expireTime as expireTime, srr.userId as userId, srr.isActive as srrActive, srr.permissionId',
      )
      .addSelect("CONCAT(`u`.`firstname`, ' ', `u`.`lastname`) AS `userName`")
      .addSelect(
        'CASE WHEN (CAST(srr.expireTime AS DATE) <= CURDATE()) THEN 1 ELSE 0 END AS expired',
      )
      .addSelect('TO_DAYS(srr.expireTime) - TO_DAYS(CURDATE()) AS days_left')
      .innerJoin(ServerRouteRole, 'srr', 'srr.id = srm.serverRouteId')
      .withDeleted()
      .innerJoin(User, 'u', 'u.id = srr.userId')
      .withDeleted(),
})
export class ServerRolesView extends BaseEntityView {
  @ViewColumn()
  id: number;
  @ViewColumn()
  userName: string;
  @ViewColumn()
  roleName: string;
  @ViewColumn()
  roleValue: string;
  @ViewColumn()
  description: string;
  @ViewColumn()
  expireTime: Date;
  @ViewColumn()
  userId: string;
  @ViewColumn()
  srrActive: number;
  @ViewColumn()
  expired: number;
  @ViewColumn()
  days_left: number | null;
  @ViewColumn()
  permissionId: number;
  @ViewColumn()
  method: METHODS;
  @ViewColumn()
  serverRouteId: number;
}
