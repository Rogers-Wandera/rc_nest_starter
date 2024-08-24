import { ViewColumn, ViewEntity } from 'typeorm';
import { LinkPermission } from '../core/linkpermissions.entity';
import { ModuleLinksView } from './modulelinks.view';
import { METHODS } from '../../coretoolkit/types/enums/enums';

@ViewEntity({
  name: 'vw_linkpermissions',
  expression: (model) =>
    model
      .createQueryBuilder()
      .select('lp.*')
      .addSelect(
        'ml.linkname as linkname, ml.name as name, ml.route as route, ml.render as render',
      )
      .from(LinkPermission, 'lp')
      .innerJoin(ModuleLinksView, 'ml', 'ml.id = lp.moduleLinkId')
      .where('lp.isActive = 1'),
})
export class LinkPermissionView {
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
}
