import { BadRequestException, Injectable } from '@nestjs/common';
import { RolePermission } from '../../../../entities/core/rolepermissions.entity';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';
import { ServerRouteRoleService } from '../serverrouteroles/serverrouteroles.service';
import { QueryFailedError } from 'typeorm';
import { LinkPermissionView } from '../../../../entities/coreviews/linkpermissions.view';
import { ModuleRolesView } from '../../../../entities/coreviews/moduleroles.view';
import { RolePermissionsData } from './type';

@Injectable()
export class RolePermissionService extends EntityModel<RolePermission> {
  constructor(
    source: EntityDataSource,
    private readonly serverroute: ServerRouteRoleService,
  ) {
    super(RolePermission, source);
  }

  async ViewRolepermissions(linkId: number, userId: string) {
    try {
      const result: RolePermissionsData[] = await this.repository
        .createQueryBuilder()
        .select('lp.*')
        .addSelect(
          'rp.roleId,rp.id as rpId,mr.userId,CASE WHEN mr.id IS NULL THEN 0 ELSE 1 END AS checked',
        )
        .addSelect('mr.groupId as groupId, mr.groupName as groupName')
        .addSelect('mr.memberId as memberId, mr.userName as userName')
        .addSelect(
          "CASE WHEN mr.memberId IS NULL THEN 'user' ELSE 'group' END AS permissionType",
        )
        .addSelect('CASE WHEN rp.id IS NULL THEN 0 ELSE 1 END', 'is_assigned')
        .from(LinkPermissionView, 'lp')
        .leftJoin(
          RolePermission,
          'rp',
          'rp.permissionId = lp.id AND rp.isActive = 1',
        )
        .leftJoin(
          ModuleRolesView,
          'mr',
          'mr.id = rp.roleId AND mr.userId = :userId',
        )
        .where('lp.moduleLinkId = :moduleLinkId')
        .setParameter('userId', userId)
        .setParameter('moduleLinkId', linkId)
        .getRawMany();
      return result;
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
