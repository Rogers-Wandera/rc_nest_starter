import { BadRequestException, Injectable } from '@nestjs/common';
import { RolePermission } from '../../../../entities/core/rolepermissions.entity';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';
import { ServerRouteRoleService } from '../serverrouteroles/serverrouteroles.service';
import { QueryFailedError } from 'typeorm';
import { LinkPermissionView } from '../../../../entities/coreviews/linkpermissions.view';
import { ModuleRolesView } from '../../../../entities/coreviews/moduleroles.view';
import { RolePermissionsData } from './type';
import { PermissionRolesView } from '@core/maincore/entities/coreviews/permissions.view';

type withuser = {
  type: 'user';
  value: string;
};
type withgroup = {
  type: 'group';
  value: number;
};
export type permissionprops = (withgroup | withuser) & {
  moduleLinkId: number;
};

@Injectable()
export class RolePermissionService extends EntityModel<RolePermission> {
  constructor(
    source: EntityDataSource,
    private readonly serverroute: ServerRouteRoleService,
  ) {
    super(RolePermission, source);
  }

  async getUnAssignedPermissions({
    value,
    type,
    moduleLinkId,
  }: permissionprops) {
    const field = type === 'user' ? { userId: value } : { groupId: value };
    const repository = this.model.manager.getRepository(LinkPermissionView);
    const assigned = await this.model.manager
      .getRepository(PermissionRolesView)
      .find({
        where: { ...field, moduleLinkId },
      });
    const ids = assigned.map((item) => item.id);
    const query = repository
      .createQueryBuilder('lp')
      .select('lp.*')
      .addSelect('null AS roleId, null AS rpId, null AS userId, 0 AS checked')
      .addSelect('NULL AS groupId, null AS groupName, NULL as userName')
      .addSelect(`'${type}' AS permissionType, 0 AS is_assigned`)
      .where('lp.isActive = 1')
      .andWhere('lp.moduleLinkId = :moduleLinkId', { moduleLinkId });

    if (ids.length > 0) {
      query.andWhere('lp.id NOT IN (:...ids)', { ids });
    }
    return query.getRawMany() as unknown as PermissionRolesView[];
  }

  async ViewRolepermissions({ value, type, moduleLinkId }: permissionprops) {
    try {
      const field = type === 'user' ? { userId: value } : { groupId: value };
      const repository = this.model.manager.getRepository(PermissionRolesView);
      const assigned = await repository.find({
        where: { permissionType: type, moduleLinkId, ...field },
      });
      const unassignedpermissions = await this.getUnAssignedPermissions({
        value,
        type,
        moduleLinkId,
      } as permissionprops);

      const data = [...assigned, ...unassignedpermissions];
      // const querydata = this.model.manager
      //   .createQueryBuilder()
      //   .select('lp.*')
      //   .addSelect(`rp.roleId,rp.id as rpId,mr.userId`)
      //   .addSelect(
      //     'CASE WHEN mr.id IS NULL THEN 0 ELSE CASE WHEN rp.isActive = 1 THEN 1 ELSE 0 END END AS checked',
      //   )
      //   .addSelect('mr.groupId as groupId, mr.groupName as groupName')
      //   .addSelect('mr.userName as userName')
      //   .addSelect(
      //     "CASE WHEN mr.userId IS NOT NULL THEN 'user' ELSE 'group' END AS permissionType",
      //   )
      //   .addSelect(
      //     'CASE WHEN rp.id IS NULL OR rp.isActive = 0 THEN 0 ELSE 1 END',
      //     'is_assigned',
      //   )
      //   .from(LinkPermissionView, 'lp')
      //   .withDeleted()
      //   .leftJoin(RolePermission, 'rp', 'rp.permissionId = lp.id')
      //   .withDeleted()
      //   .leftJoin(
      //     ModuleRolesView,
      //     'mr',
      //     `mr.id = rp.roleId AND (mr.${type === 'user' ? 'userId' : 'groupId'} = :${type === 'user' ? 'userId' : 'groupId'} OR mr.${type === 'user' ? 'userId' : 'groupId'} IS NULL)`,
      //   )
      //   .where(
      //     `lp.moduleLinkId = :moduleLinkId AND (mr.${type === 'user' ? 'userId' : 'groupId'} = :${type === 'user' ? 'userId' : 'groupId'} OR rp.id IS NULL)`,
      //   )
      //   .withDeleted()
      //   .setParameter(`${type === 'user' ? 'userId' : 'groupId'}`, value)
      //   .setParameter('moduleLinkId', linkId);
      // const result = await querydata.getRawMany<RolePermissionsData>();
      // return result;
      return data as unknown as RolePermissionsData[];
    } catch (error) {
      throw error;
    }
  }

  private ValidateSave() {
    if (
      this.entity.linkrole.ModuleLink.id !==
      this.entity.linkpermission.ModuleLink.id
    ) {
      throw new BadRequestException(
        'The permission does not belong to this route',
      );
    }
  }

  private async HandleDeleted(id: number) {
    try {
      this.serverroute.entity.rolepermission = this.entity;
      const response = await this.serverroute.RestoreDeleted();
      if (response) {
        await this.repository.restoreDelete({
          id: id,
        });
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async AddPermission() {
    try {
      this.ValidateSave();
      const exists = await this.repository.findOne({
        where: {
          linkrole: { id: this.entity.linkrole.id },
          linkpermission: { id: this.entity.linkpermission.id },
        },
        withDeleted: true,
      });
      if (exists) {
        if (exists.isActive === 0 && exists.deletedAt !== null) {
          this.entity = { ...exists, ...this.entity };
          const response = await this.HandleDeleted(exists.id);
          return response;
        }
      }
      this.serverroute.entity.roleName = this.entity.linkpermission.accessName;
      this.serverroute.entity.roleValue =
        this.entity.linkpermission.accessRoute;
      this.serverroute.entity.description =
        this.entity.linkpermission.description;
      this.serverroute.entity.expireTime = this.entity.linkrole.expireDate;
      this.serverroute.entity.createdBy = this.entity.createdBy;
      const response = await this.repository.save(this.entity);
      if (response.id) {
        this.serverroute.entity.rolepermission = response;
        await this.serverroute.addServerRoute(
          this.entity.linkpermission.method,
        );
      }
      return response.id > 0;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UQ_ROLE')) {
          const isgroup = this.entity.linkrole?.group ? 'group' : 'user';
          throw new BadRequestException(
            `The permission already exists on this ${isgroup}`,
          );
        }
      }
      throw error;
    }
  }

  async DeletePermission() {
    try {
      this.serverroute.entity.rolepermission = this.entity;
      const response = await this.repository.softDataDelete({
        id: this.entity.id,
      });
      if (response.affected === 1) {
        await this.serverroute.DeleteServerRoute();
      }
      return response.affected === 1;
    } catch (error) {
      throw error;
    }
  }
}
