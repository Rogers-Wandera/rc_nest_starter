import { BadRequestException, Injectable } from '@nestjs/common';
import { ModuleLink } from '../../../../entities/core/modulelinks.entity';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';
import { ModuleService } from '../modules/modules.service';
import { QueryFailedError } from 'typeorm';
import { ModuleLinksView } from '../../../../entities/coreviews/modulelinks.view';
import { LinkPermissionView } from '@core/maincore/entities/coreviews/linkpermissions.view';
import { Module } from '@core/maincore/entities/core/modules.entity';

@Injectable()
export class ModuleLinksService extends EntityModel<ModuleLink> {
  constructor(
    source: EntityDataSource,
    private modules: ModuleService,
  ) {
    super(ModuleLink, source);
  }

  async addModuleLink(moduleId: number) {
    try {
      const moduleexists = await this.modules.FindOne({ id: moduleId });
      if (!moduleexists) {
        throw new Error(`No module found`);
      }
      const exists = await this.repository.findOne({
        where: { linkname: this.entity.linkname, module: { id: moduleId } },
        withDeleted: true,
      });
      if (exists) {
        if (exists.isActive === 0 && exists.deletedAt !== null) {
          await this.repository.restoreDelete({ id: exists.id });
          return exists;
        }
      }
      const position = await this.repository.countField('position', {
        where: { module: { id: moduleId } },
      });
      if (position) {
        this.entity.position = position + 1;
      } else {
        this.entity.position = 1;
      }
      this.entity.module = moduleexists;
      const entity = this.repository.create(this.entity);
      const response = await this.repository.save(entity);
      return response;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UQ_moduleId_linkname')) {
          throw new BadRequestException(
            `The module link ${this.entity.linkname} already exists on this module ${this.entity.module.name}`,
          );
        }
      }
      throw error;
    }
  }

  async updateModeleLink() {
    try {
      const module = await this.repository.findReject({
        where: { id: this.entity.id },
        relations: ['module'],
      });
      if (module.position === this.entity.position) {
        const data = { ...module, ...this.entity };
        const response = await this.repository.FindOneAndUpdate(
          { id: this.entity.id },
          data,
        );
        return response;
      }
      const withposition = await this.repository.findOne({
        where: {
          position: this.entity.position,
          module: { id: module.module.id },
        },
      });
      if (!withposition) {
        throw new BadRequestException('The position does not exist');
      }
      this.entity.position = withposition.position;
      withposition.position = module.position;
      const newdata = { ...module, ...this.entity };
      const response = await this.repository.FindOneAndUpdate(
        { id: module.id },
        newdata,
      );
      await this.repository.FindOneAndUpdate(
        { id: withposition.id },
        withposition,
      );
      return response;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UQ_moduleId_linkname')) {
          throw new BadRequestException(
            `The module link ${this.entity.linkname} already exists on this module ${this.entity.module.name}`,
          );
        }
      }
      throw error;
    }
  }

  async DeleteLink() {
    try {
      const response = await this.repository.softDataDelete({
        id: this.entity.id,
      });
      return response.affected === 1;
    } catch (error) {
      throw error;
    }
  }

  async ViewModuleLinks(moduleId: number) {
    try {
      const pagination = this.transformPaginateProps<ModuleLinksView>();
      const permissionview = this.model.getRepository(LinkPermissionView);
      pagination.conditions = { moduleId: moduleId };
      const repository = this.model.getRepository(ModuleLinksView);
      const data = await repository.Paginate(pagination);
      if (data.docs.length > 0) {
        const newdocs = await Promise.all(
          data.docs.map(async (link) => {
            const permissions = await permissionview.findBy({
              moduleLinkId: link.id,
            });
            link['permissions'] = permissions;
            return link;
          }),
        );
        data.docs = newdocs;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async TransferLink(moduleId: number, module: Module) {
    try {
      console.log(this.entity);
      if (this?.entity.module.id === moduleId) {
        throw new BadRequestException('You cannot transfer to the same module');
      }
      const position = await this.repository.countField('position', {
        where: { module: { id: moduleId } },
      });
      if (position) {
        this.entity.position = position + 1;
      } else {
        this.entity.position = 1;
      }
      this.entity.module = module;
      const response = await this.repository.save(this.entity);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
