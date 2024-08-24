import { ViewColumn, ViewEntity } from 'typeorm';
import { Systemrole } from '../core/systemroles.entity';
import { Role } from '../core/roles.entity';

@ViewEntity({
  name: 'user_roles',
  expression: (model) =>
    model
      .createQueryBuilder()
      .select('rs.*')
      .addSelect('sr.value', 'role')
      .addSelect('sr.rolename', 'rolename')
      .addSelect('sr.description', 'description')
      .addSelect('sr.released', 'released')
      .from(Role, 'rs')
      .innerJoin(Systemrole, 'sr', 'sr.id = rs.roleId'),
})
export class UserRolesView {
  @ViewColumn()
  id: number;
  @ViewColumn()
  userId: string;
  @ViewColumn()
  roleId: number;
  @ViewColumn()
  isActive: number;
  @ViewColumn()
  role: number;
  @ViewColumn()
  rolename: string;
  @ViewColumn()
  description: string;
  @ViewColumn()
  released: number;
}
