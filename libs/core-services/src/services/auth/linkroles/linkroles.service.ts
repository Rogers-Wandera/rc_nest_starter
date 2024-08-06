import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomRepository } from '@bridge/data-bridge/ormextender/customrepository';
import { LinkRole } from '@entity/entities/core/linkroles.entity';
import { ModuleRolesView } from '@entity/entities/coreviews/moduleroles.view';
import { QueryFailedError } from 'typeorm';
import { ModuleLinksView } from '@entity/entities/coreviews/modulelinks.view';
import { EntityModel } from '@bridge/data-bridge/model/entity.model';
import { EntityDataSource } from '@bridge/data-bridge/model/enity.data.model';
import { UserModuleRes } from '@toolkit/core-toolkit/types/coretypes';

@Injectable()
export class LinkRoleService extends EntityModel<LinkRole> {
  private readonly rolesrepo: CustomRepository<ModuleRolesView>;
  constructor(source: EntityDataSource) {
    super(LinkRole, source);
    this.rolesrepo = this.model.getRepository(ModuleRolesView);
  }

  async AddLinkroles() {
    try {
      const exists = await this.repository.findOne({
        where: {
          ModuleLink: { id: this.entity.ModuleLink.id },
          User: { id: this.entity.User.id },
        },
        withDeleted: true,
      });
      if (exists) {
        if (exists.isActive === 0 && exists.deletedAt !== null) {
          const response = await this.repository.restoreDelete(
            {
              id: exists.id,
            },
            { expireDate: this.entity.expireDate },
          );
          return response.affected === 1;
        }
      }
      const results = await this.repository.save(this.entity);
      return results.id > 0;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UQ_Role_User')) {
          throw new BadRequestException(
            `The ${this.entity.ModuleLink.linkname} role already exists on this user`,
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
      const pagination = this.transformPaginateProps<ModuleRolesView>();
      pagination.conditions = { userId: this.entity.User.id };
      const data = await this.model.findPaginate(ModuleRolesView, pagination);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getToAssignRoles() {
    try {
      const response = await this.model.manager
        .createQueryBuilder(ModuleLinksView, 'ml')
        .leftJoin(
          ModuleRolesView,
          'mr',
          'ml.id = mr.moduleLinkId AND mr.userId = :userId',
          { userId: this.entity.User.id },
        )
        .where('mr.moduleLinkId IS NULL')
        .andWhere('ml.isActive = :isActive', { isActive: 1 })
        .andWhere('ml.released = :released', { released: 1 })
        .getMany();
      return response;
    } catch (error) {
      throw error;
    }
  }
}
