import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CustomRepository } from '../../../../databridge/ormextender/customrepository';
import { LinkRole } from '../../../../entities/core/linkroles.entity';
import { ModuleRolesView } from '../../../../entities/coreviews/moduleroles.view';
import { IsNull, Not, QueryFailedError } from 'typeorm';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';
import {
  PaginationResults,
  UserModuleRes,
  UserServerRoles,
  UserServerRolesGroup,
} from '../../../../coretoolkit/types/coretypes';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ROLE } from '@core/maincore/coretoolkit/types/enums/enums';
import { UserLinkRolesView } from '@core/maincore/entities/coreviews/userlinkroles.view';
import { RolePermissionService } from '../rolepermissions/rolepermission.service';
import { GroupLinkRolesView } from '@core/maincore/entities/coreviews/grouplinkroles.view';
import { UserModuleRolesView } from '@core/maincore/entities/coreviews/user.moduleroles.view';

@Injectable()
export class LinkRoleService extends EntityModel<LinkRole> {
  private readonly rolesrepo: CustomRepository<UserModuleRolesView>;
  constructor(
    source: EntityDataSource,
    @Inject(REQUEST) protected request: Request,
    private permissions: RolePermissionService,
  ) {
    super(LinkRole, source);
    this.rolesrepo = this.model.getRepository(UserModuleRolesView);
  }

  private async checkUserHasRole() {
    const repository = this.model.manager.getRepository(ModuleRolesView);
    const roleexists = await repository.findOne({
      where: {
        userId: this.entity.User.id,
        moduleLinkId: this.entity.ModuleLink.id,
        groupId: Not(IsNull()),
      },
    });
    if (roleexists) {
      throw new BadRequestException(
        `The role has already been set for this user in the ${roleexists.groupName} group`,
      );
    }
    return false;
  }

  async AddLinkroles(type: 'group' | 'user' = 'user') {
    try {
      const condition =
        type === 'user'
          ? { User: { id: this.entity.User.id } }
          : { group: { id: this.entity.group.id } };
      if (type === 'user') {
        await this.checkUserHasRole();
      }
      const exists = await this.repository.findOne({
        where: {
          ModuleLink: { id: this.entity.ModuleLink.id },
          ...condition,
        },
        withDeleted: true,
      });
      if (type === 'user') {
        if (this.entity.User.id === this.request.user.id) {
          const registeredroles = this.request.user.roles;
          const checkhasrole = registeredroles.includes(ROLE.MAIN);
          if (!checkhasrole) {
            throw new ForbiddenException(
              `You cannot add roles to yourself, contact main admin`,
            );
          }
        }
      }
      if (exists) {
        if (exists.isActive === 0 && exists.deletedAt !== null) {
          const expireDate = this.entity.expireDate || null;
          const response = await this.repository.restoreDelete(
            {
              id: exists.id,
            },
            { expireDate },
          );
          return response.affected === 1;
        }
      }
      const results = await this.repository.save(this.entity);
      return results.id > 0;
      // return true;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UQ_Role_User')) {
          throw new BadRequestException(
            `The ${this.entity.ModuleLink.linkname} role already exists on this user`,
          );
        } else if (error.message.includes('UQ_Role_Group')) {
          throw new BadRequestException(
            `The ${this.entity.ModuleLink.linkname} role already exists on this group`,
          );
        }
      }
      throw error;
    }
  }

  async DeleteLinkRole() {
    try {
      const results = await this.repository.softDataDelete({
        id: this.entity.id,
      });
      return results.affected === 1;
    } catch (error) {
      throw error;
    }
  }

  async UpdateLinkRole() {
    try {
      console.log(this.entity);
      const response = await this.repository.FindOneAndUpdate(
        {
          id: this.entity.id,
        },
        { expireDate: this.entity.expireDate },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
  async getUserModules(): Promise<UserModuleRes> {
    try {
      const usermodules = await this.rolesrepo.find({
        where: { userId: this.entity.User.id },
      });
      if (usermodules.length > 0) {
        const grouped: UserModuleRes = usermodules.reduce((acc, item) => {
          const key = item.name;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push({
            name: item.name,
            linkname: item.linkname,
            route: item.route,
            expired: Number(item.expired),
            render: Number(item.render),
            icon: item.icon,
          });
          return acc;
        }, {});
        return grouped;
      }
      return {};
    } catch (error) {
      //
      throw error;
    }
  }

  async getExpiredRoles() {
    try {
      const data = await this.rolesrepo.find({ where: { expired: 1 } });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getAssignedRoles() {
    try {
      const conditions = { userId: this.entity.User.id };
      const data = await this.PaginateView(ModuleRolesView, conditions);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getToAssignRoles(
    type: 'user' | 'group' = 'user',
  ): Promise<PaginationResults<UserServerRolesGroup>> {
    try {
      const conditions: Record<string, any> = {};
      if (type != 'user') {
        conditions['groupId'] = this.entity.group.id;
      } else {
        conditions['userId'] = this.entity.User.id;
      }
      const view = type === 'user' ? UserLinkRolesView : GroupLinkRolesView;
      const data = await this.PaginateView(view, conditions);
      const value =
        type === 'user' ? this.entity.User.id : this.entity.group.id;
      let docsWithPermissions: UserServerRolesGroup[] = [];

      if (data?.docs.length > 0) {
        const formatteddata = data.docs;
        let docsPermissions: UserServerRoles[] = [];
        for (const link of formatteddata) {
          const permissions = await this.permissions.ViewRolepermissions(
            link.id,
            value,
            'group',
          );
          link.is_assigned = Number(link.is_assigned);
          docsPermissions.push({ ...link, permissions });
        }
        docsWithPermissions = this.groupData(docsPermissions);
      }
      data.docs = docsWithPermissions as unknown as UserServerRoles[];
      return data as unknown as PaginationResults<UserServerRolesGroup>;
      // return {} as PaginationResults<UserServerRolesGroup>;
    } catch (error) {
      throw error;
    }
  }

  private groupData(docs: UserServerRoles[]): UserServerRolesGroup[] {
    return docs.reduce((acc, item) => {
      const moduleName = item.name;
      const icon = item.icon;
      let group = acc.find((g) => g.module === moduleName);
      if (!group) {
        group = { module: moduleName, links: [], icon };
        acc.push(group);
      }
      group.links.push({
        ...item,
        expired: Number(item.expired),
        render: Number(item.render),
        permissions: item.permissions,
      });
      return acc;
    }, []);
  }
}
