import { ViewColumn, ViewEntity } from 'typeorm';
import { RolePermission } from '../core/rolepermissions.entity';
import { LinkPermissionView } from './linkpermissions.view';
import { ModuleRolesView } from './moduleroles.view';
import { METHODS } from '@core/maincore/coretoolkit/types/enums/enums';

@ViewEntity({
  name: 'vw_permissionroles',
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select('lp.*')
      .addSelect('rp.roleId AS roleId, rp.id as rpId,mr.userId AS userId')
      .addSelect(
        'CASE WHEN `mr`.`id` IS NULL THEN 0 ELSE CASE WHEN `rp`.`isActive` = 1 THEN 1 ELSE 0 END END AS checked',
      )
      .addSelect(
        '`mr`.`groupId` as groupId, `mr`.`groupName` as groupName, `mr`.`userName` as userName',
      )
      .addSelect(
        "CASE WHEN `mr`.`userId` IS NOT NULL THEN 'user' ELSE 'group' END AS permissionType",
      )
      .addSelect(
        'CASE WHEN `rp`.`id` IS NULL OR `rp`.`isActive` = 0 THEN 0 ELSE 1 END AS `is_assigned`',
      )
      .from(RolePermission, 'rp')
      .leftJoin(LinkPermissionView, 'lp', 'lp.id = rp.permissionId')
      .leftJoin(ModuleRolesView, 'mr', 'mr.id = rp.roleId')
      .where('rp.isActive = 1 AND lp.isActive = 1'),
})
export class PermissionRolesView {
  @ViewColumn()
  id: number;
  @ViewColumn()
  moduleLinkId: number;
  @ViewColumn()
  accessName: string;
  @ViewColumn()
  accessRoute: string;
  @ViewColumn()
  method: METHODS;
  @ViewColumn()
  description: string;
  @ViewColumn()
  creationDate: Date;
  @ViewColumn()
  createdBy: string;
  @ViewColumn()
  updatedBy: string;
  @ViewColumn()
  updateDate: Date;
  @ViewColumn()
  deleted_at: Date;
  @ViewColumn()
  deletedBy: string;
  @ViewColumn()
  isActive: number;
  @ViewColumn()
  linkname: string;
  @ViewColumn()
  name: string;
  @ViewColumn()
  route: string;
  @ViewColumn()
  render: string;
  @ViewColumn()
  roleId: number;
  @ViewColumn()
  rpId: number;
  @ViewColumn()
  userId: null | string;
  @ViewColumn()
  checked: number;
  @ViewColumn()
  groupId: null | number;
  @ViewColumn()
  groupName: string | null;
  @ViewColumn()
  userName: string | null;
  @ViewColumn()
  permissionType: 'user' | 'group';
  @ViewColumn()
  is_assigned: number;
}
