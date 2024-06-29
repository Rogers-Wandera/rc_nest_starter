import { BadRequestException, Injectable } from '@nestjs/common';
import { LinkPermission } from 'src/entity/core/linkpermissions.entity';
import { LinkPermissionView } from 'src/entity/coreviews/linkpermissions.view';
import { EntityDataSource } from 'src/model/enity.data.model';
import { EntityModel } from 'src/model/entity.model';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class LinkPermissionService extends EntityModel<LinkPermission> {
  constructor(source: EntityDataSource) {
    super(LinkPermission, source);
  }

  async AddPermission() {
    try {
      const response = await this.repository.save(this.entity);
      return response.id > 0;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UQ_permission')) {
          throw new BadRequestException(
            'The Permission already exists on ' +
              this.entity.ModuleLink.linkname,
          );
        }
      }
      throw error;
    }
  }
  async UpdatePermission() {
    try {
      const response = await this.repository.FindOneAndUpdate(
        { id: this.entity.id },
        this.entity,
      );
      return response;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UQ_permission')) {
          throw new BadRequestException(
            'The Permission already exists on ' +
              this.entity.ModuleLink.linkname,
          );
        }
      }
      throw error;
    }
  }
  async DeletePermsission() {
    try {
      const results = await this.repository.softDataDelete({
        id: this.entity.id,
      });
      return results.affected === 1;
    } catch (error) {
      throw error;
    }
  }

  async ViewPermissions(linkId: number) {
    const pagination = this.transformPaginateProps<LinkPermissionView>();
    pagination.conditions = { moduleLinkId: linkId };
    return this.model.findPaginate(LinkPermissionView, pagination);
  }

  async ViewSelectPermissions(linkId: number) {
    const repository = this.model.getRepository(LinkPermissionView);
    const data = await repository.find({ where: { moduleLinkId: linkId } });
    return data;
  }
}
