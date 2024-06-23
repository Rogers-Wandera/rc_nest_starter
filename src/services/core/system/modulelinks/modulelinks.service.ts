import { Injectable } from '@nestjs/common';
import { ModuleLink } from 'src/entity/core/modulelinks.entity';
import { EntityDataSource } from 'src/model/enity.data.model';
import { EntityModel } from 'src/model/entity.model';
import { ModuleService } from '../modules/modules.service';

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
        where: { linkname: this.entity.linkname, module: moduleexists },
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
      console.log(position);
      if (position) {
        this.entity.position = position + 1;
      } else {
        this.entity.position = 1;
      }
      this.entity.module = moduleexists;
      const response = await this.repository.save(this.entity);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
