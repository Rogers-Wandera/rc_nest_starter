import { ViewColumn, ViewEntity } from 'typeorm';
import { ModuleLinksView } from './modulelinks.view';
import { ModuleRolesView } from './moduleroles.view';
import { UserGroup } from '../core/usergroups.entity';

@ViewEntity({
  name: 'vw_grouplinkroles',
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select('ml.*')
      .addSelect('mr.id', 'linkRoleId')
      .addSelect('mr.userId', 'userId')
      .addSelect('mr.groupId', 'groupId')
      .addSelect(`CASE WHEN mr.id IS NOT NULL THEN 1 ELSE 0 END`, 'is_assigned')
      .addSelect('mr.expireDate', 'expireDate')
      .addSelect('mr.expired', 'expired')
      .addSelect('mr.days_left', 'days_left')
      .from(UserGroup, 'ur')
      .innerJoin(ModuleLinksView, 'ml', '1 = 1')
      .leftJoin(
        ModuleRolesView,
        'mr',
        'mr.moduleLinkId = ml.id AND ur.id = mr.groupId',
      )
      .where('ml.isActive = 1')
      .andWhere('ml.released = 1'),
})
export class GroupLinkRolesView {
  @ViewColumn()
  id: number;

  @ViewColumn()
  linkname: string;

  @ViewColumn()
  route: string;

  @ViewColumn()
  position: number;

  @ViewColumn()
  render: number;

  @ViewColumn()
  released: number;

  @ViewColumn()
  moduleId: number;

  @ViewColumn()
  name: string;

  @ViewColumn()
  mpos: number;

  @ViewColumn()
  icon: string;

  @ViewColumn()
  linkRoleId: number | null;

  @ViewColumn()
  userName: string | null;

  @ViewColumn()
  is_assigned: number;

  @ViewColumn()
  expireDate: string | null;

  @ViewColumn()
  expired: number | null;

  @ViewColumn()
  days_left: number | null;

  @ViewColumn()
  groupId: number;

  @ViewColumn()
  userId: string | null;
}
