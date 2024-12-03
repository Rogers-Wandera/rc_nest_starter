import { ViewColumn, ViewEntity } from 'typeorm';
import { ModuleLink } from '../core/modulelinks.entity';
import { Module } from '../core/modules.entity';

@ViewEntity({
  name: 'vw_module_links',
  expression: (model) =>
    model
      .createQueryBuilder()
      .select('ml.*')
      .addSelect('m.name as name, m.position as mpos, m.icon as icon')
      .from(ModuleLink, 'ml')
      .innerJoin(Module, 'm', 'm.id = ml.moduleId')
      .where('m.isActive = 1')
      .andWhere('ml.isActive = 1')
      .orderBy('ml.position'),
})
export class ModuleLinksView {
  @ViewColumn()
  id: number;
  @ViewColumn()
  moduleId: number;
  @ViewColumn()
  linkname: string;
  @ViewColumn()
  route: string;
  @ViewColumn()
  position: number;
  @ViewColumn()
  deleted_at: Date;
  @ViewColumn()
  creationDate: Date;
  @ViewColumn()
  isActive: number;
  @ViewColumn()
  released: number;
  @ViewColumn()
  render: number;
  @ViewColumn()
  name: string;
  @ViewColumn()
  mpos: number;
  @ViewColumn()
  icon: string;
}
