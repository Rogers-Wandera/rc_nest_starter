import { ViewColumn, ViewEntity } from 'typeorm';
import { ServerRouteMethod } from '../core/serverroutemethods.entity';
import { ServerRouteRole } from '../core/serverrouteroles.entity';
import { BaseEntityView } from '../baseview';
import { METHODS } from '../../coretoolkit/types/enums/enums';
import { RolePermission } from '../core/rolepermissions.entity';
import { UserModuleRolesView } from './user.moduleroles.view';

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
        'srr.expireTime as expireTime, srr.isActive as srrActive, srr.permissionId',
      )
      .addSelect('mrv.userName AS `userName`')
      .addSelect('mrv.userId as userId, mrv.groupId as groupId')
      .addSelect('mrv.groupName as groupName')
      .addSelect(
        'CASE WHEN (CAST(srr.expireTime AS DATE) <= CURDATE()) THEN 1 ELSE 0 END AS expired',
      )
      .addSelect('TO_DAYS(srr.expireTime) - TO_DAYS(CURDATE()) AS days_left')
      .innerJoin(ServerRouteRole, 'srr', 'srr.id = srm.serverRouteId')
      .innerJoin(RolePermission, 'lpv', 'lpv.id = srr.permissionId')
      .innerJoin(UserModuleRolesView, 'mrv', 'mrv.id = lpv.roleId')
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
  expired: number | null;
  @ViewColumn()
  days_left: number | null;
  @ViewColumn()
  permissionId: number;
  @ViewColumn()
  method: METHODS;
  @ViewColumn()
  serverRouteId: number;
  @ViewColumn()
  groupId: string;
  @ViewColumn()
  groupName: string;
}
