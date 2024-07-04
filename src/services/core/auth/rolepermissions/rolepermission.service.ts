import { BadRequestException, Injectable } from '@nestjs/common';
import { RolePermission } from 'src/entity/core/rolepermissions.entity';
import { EntityDataSource } from 'src/model/enity.data.model';
import { EntityModel } from 'src/model/entity.model';
import { ServerRouteRoleService } from '../serverrouteroles/serverrouteroles.service';
import { QueryFailedError } from 'typeorm';
import { LinkPermissionView } from 'src/entity/coreviews/linkpermissions.view';
import { ModuleRolesView } from 'src/entity/coreviews/moduleroles.view';

@Injectable()
export class RolePermissionService extends EntityModel<RolePermission> {
  constructor(
    source: EntityDataSource,
    private readonly serverroute: ServerRouteRoleService,
  ) {
    super(RolePermission, source);
  }

  async ViewRolepermissions(linkId: number) {
    try {
      const result = await this.repository
        .createQueryBuilder()
        .select('lp.*')
        .addSelect(
          'rp.roleId,rp.id as rpId,mr.userId,CASE WHEN mr.id IS NULL THEN 0 ELSE 1 END AS checked',
        )
        .from(LinkPermissionView, 'lp')
        .leftJoin(
          RolePermission,
          'rp',
          'rp.permissionId = lp.id AND rp.isActive = 1 AND rp.userId = :userId',
        )
        .leftJoin(
          ModuleRolesView,
          'mr',
          'mr.id = rp.roleId AND mr.userId = :userId',
        )
        .where('lp.moduleLinkId = :moduleLinkId')
        .setParameter('userId', this.entity.user.id)
        .setParameter('moduleLinkId', linkId)
        .getRawMany();
      return result;
    } catch (error) {
      throw error;
    }
  }

  private ValidateSave() {
    if (this.entity.user.id !== this.entity.linkrole.User.id) {
      throw new BadRequestException(
        'Cannot set a role of another user to this user',
      );
    }
    if (
      this.entity.linkrole.ModuleLink.id !==
      this.entity.linkpermission.ModuleLink.id
    ) {
      throw new BadRequestException(
        'The permission does not belong to this link',
      );
    }
    if (!this.entity.linkrole.expireDate) {
      throw new BadRequestException(
        'The expiredate cannot be null, please check the date set on the role',
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
          user: { id: this.entity.user.id },
          linkrole: { id: this.entity.linkrole.id },
          linkpermission: { id: this.entity.linkpermission.id },
        },
        withDeleted: true,
      });
      if (exists) {
        if (exists.isActive === 0 && exists.deletedAt !== null) {
          const response = await this.HandleDeleted(exists.id);
          return response;
        }
      }
      this.serverroute.entity.roleName = this.entity.linkpermission.accessName;
      this.serverroute.entity.roleValue =
        this.entity.linkpermission.accessRoute;
      this.serverroute.entity.user = this.entity.user;
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
          throw new BadRequestException(
            `The permission already exists on this user`,
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
