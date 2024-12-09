import { BadRequestException, Injectable } from '@nestjs/common';
import { LinkPermission } from '../../../../entities/core/linkpermissions.entity';
import { LinkPermissionView } from '../../../../entities/coreviews/linkpermissions.view';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class LinkPermissionService extends EntityModel<LinkPermission> {
  constructor(source: EntityDataSource) {
    super(LinkPermission, source);
  }

  async AddPermission() {
    try {
      const exists = await this.repository.findOneByConditions({
        accessName: this.entity.accessName,
        ModuleLink: { id: this.entity.ModuleLink.id },
      });
      if (exists && exists.isActive == 0) {
        exists.description = this.entity.accessRoute;
        exists.accessRoute = this.entity.accessRoute;
        exists.deletedAt = null;
        exists.isActive = 1;
        await this.repository.save(exists);
        return true;
      }
      const entity = this.repository.create(this.entity);
      const response = await this.repository.save(entity);
      return response.id > 0;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UQ_permission')) {
          throw new BadRequestException(
            'The Permission already exists on ' +
              this.entity.ModuleLink.linkname,
          );
        } else if (error.message.includes('Data too long')) {
          throw new BadRequestException(
            `[${this.entity.accessName}] accessName too long please, make sure value does not exceed length of 50`,
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
    const repository = this.model.getRepository(LinkPermissionView);
    pagination.conditions = { moduleLinkId: linkId };
    return repository.Paginate(pagination);
  }

  async ViewSelectPermissions(linkId: number) {
    const repository = this.model.getRepository(LinkPermissionView);
    const data = await repository.find({ where: { moduleLinkId: linkId } });
    return data;
  }
}
