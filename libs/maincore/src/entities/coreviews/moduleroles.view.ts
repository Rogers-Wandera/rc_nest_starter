import { ViewColumn, ViewEntity } from 'typeorm';
import { LinkRole } from '../core/linkroles.entity';
import { ModuleLinksView } from './modulelinks.view';
import { User } from '../core/users.entity';
import { UserGroup } from '../core/usergroups.entity';
import { UserGroupMember } from '../core/usergroupmembers.entity';

@ViewEntity({
  name: 'vw_module_roles',
  expression: (model) =>
    model
      .createQueryBuilder()
      .select('roles.*')
      .from((subquery) => {
        subquery
          .select(
            'lr.id as id, lr.expireDate as expireDate, lr.moduleLinkId as moduleLinkId',
          )
          .addSelect(
            'CASE WHEN (lr.userId IS NULL) THEN ugm.userId ELSE lr.userId END AS userId',
          )
          .addSelect('lr.groupId as groupId')
          .addSelect('lr.isActive as isActive, lr.createdBy as createdBy')
          .addSelect(
            'lr.creationDate as creationDate, lr.updatedBy as updatedBy',
          )
          .addSelect('lr.updateDate as updateDate, lr.deleted_at as deleted_at')
          .addSelect('lr.deletedBy as deletedBy')
          .addSelect('ml.linkname as linkname, ml.route as route')
          .addSelect('ml.position as mlpos,ml.released as released')
          .addSelect('ml.render as render, ml.mpos as mpos, ml.name')
          .addSelect('CONCAT(u.firstname, " ", u.lastname) as userName')
          .addSelect(
            'CASE WHEN (CAST(lr.expireDate AS DATE) <= CURDATE()) THEN 1 ELSE 0 END AS expired',
          )
          .addSelect('TO_DAYS(lr.expireDate) - TO_DAYS(CURDATE()) AS days_left')
          .addSelect('ug.groupName as groupName')
          .addSelect('ugm.id as memberId')
          .addSelect(
            `ROW_NUMBER() OVER (
              PARTITION BY u.id, lr.moduleLinkId 
              ORDER BY 
                CASE 
                  WHEN lr.groupId IS NOT NULL AND (CAST(lr.expireDate AS DATE) > CURDATE() OR lr.expireDate IS NULL) THEN 1
                  ELSE 2 
                END,
                CASE 
                  WHEN lr.groupId IS NULL THEN 1 
                  ELSE 2 
                END
            ) AS rownumber`,
          )
          .from(LinkRole, 'lr')
          .innerJoin(ModuleLinksView, 'ml', 'ml.id = lr.moduleLinkId')
          .leftJoin(
            UserGroupMember,
            'ugm',
            'ugm.groupId = lr.groupId and ugm.isActive = 1',
          )
          .leftJoin(
            User,
            'u',
            'u.id = lr.userId OR u.id = ugm.userId and u.isActive = 1',
          )
          .leftJoin(UserGroup, 'ug', 'ug.id = lr.groupId and ug.isActive = 1')
          .where('lr.isActive = 1')
          .orderBy('ml.mpos, ml.position');
        return subquery;
      }, 'roles')
      .where('roles.rownumber = 1'),
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
  @ViewColumn()
  groupId: string | null;
  @ViewColumn()
  groupName: string | null;
  @ViewColumn()
  memberId: string | null;
}
