import { ViewColumn, ViewEntity } from 'typeorm';
import { LinkRole } from '../core/linkroles.entity';
import { ModuleLinksView } from './modulelinks.view';
import { User } from '../core/users.entity';

@ViewEntity({
  name: 'vw_module_roles',
  expression: (model) =>
    model
      .createQueryBuilder()
      .select('lr.*')
      .addSelect('ml.linkname as linkname, ml.route as route')
      .addSelect('ml.position as mlpos,ml.released as released')
      .addSelect('ml.render as render, ml.mpos as mpos, ml.name')
      .addSelect('CONCAT(u.firstname, " ", u.lastname) as userName')
      .addSelect(
        'CASE WHEN (CAST(lr.expireDate AS DATE) <= CURDATE()) THEN 1 ELSE 0 END AS expired',
      )
      .addSelect('TO_DAYS(lr.expireDate) - TO_DAYS(CURDATE()) AS days_left')
      .from(LinkRole, 'lr')
      .innerJoin(ModuleLinksView, 'ml', 'ml.id = lr.moduleLinkId')
      .innerJoin(User, 'u', 'u.id = lr.userId and u.isActive = 1')
      .where('lr.isActive = 1')
      .orderBy('ml.mpos, ml.position'),
})
export class ModuleRolesView {
  @ViewColumn()
  id: number;
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
  moduleLinkId: number;
  @ViewColumn()
  userId: string;
  @ViewColumn()
  expireDate: Date;
  @ViewColumn()
  linkname: string;
  @ViewColumn()
  name: string;
  @ViewColumn()
  route: string;
  @ViewColumn()
  render: string;
  @ViewColumn()
  released: number;
  @ViewColumn()
  mpos: number;
  @ViewColumn()
  userName: string;
  @ViewColumn()
  expired: number;
  @ViewColumn()
  days_left: number | null;
}
