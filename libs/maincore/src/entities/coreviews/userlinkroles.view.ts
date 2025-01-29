import { ViewColumn, ViewEntity } from 'typeorm';
import { ModuleLinksView } from './modulelinks.view';
import { UserDataView } from './userdata.view';
import { UserModuleRolesView } from './user.moduleroles.view';

@ViewEntity({
  name: 'vw_userlinkroles',
  expression: (connection) =>
    connection
      .createQueryBuilder()
      .select('ml.*')
      .addSelect('mr.id', 'linkRoleId')
      .addSelect('mr.userName', 'userName')
      .addSelect(`CASE WHEN mr.id IS NOT NULL THEN 1 ELSE 0 END`, 'is_assigned')
      .addSelect('mr.expireDate', 'expireDate')
      .addSelect('mr.expired', 'expired')
      .addSelect('mr.days_left', 'days_left')
      .addSelect('ur.id', 'userId')
      .addSelect('mr.groupId', 'groupId')
      .from(UserDataView, 'ur')
      .innerJoin(ModuleLinksView, 'ml', '1 = 1')
      .leftJoin(
        UserModuleRolesView,
        'mr',
        'mr.moduleLinkId = ml.id AND ur.id = mr.userId',
      )
      .where('ml.isActive = 1')
      .andWhere('ml.released = 1'),
})
export class UserLinkRolesView {
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
  userId: string;

  @ViewColumn()
  groupId: number;
}
