import { BadRequestException, Injectable } from '@nestjs/common';
import { Module } from '../../../../entities/core/modules.entity';
import { EntityModel } from '../../../../databridge/model/entity.model';
import { EntityDataSource } from '../../../../databridge/model/enity.data.model';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class ModuleService extends EntityModel<Module> {
  constructor(source: EntityDataSource) {
    super(Module, source);
  }
  async addModule() {
    try {
      const exists = await this.repository.findOne({
        where: { name: this.entity.name },
        withDeleted: true,
      });
      if (exists) {
        if (exists.isActive === 0 && exists.deletedAt !== null) {
          await this.repository.restoreDelete({ id: exists.id });
          return exists;
        }
      }
      const position = await this.repository.countField('position');
      if (position) {
        this.entity.position = position + 1;
      } else {
        this.entity.position = 1;
      }
      const entity = this.repository.create(this.entity);
      const response = await this.repository.save(entity);
      return response;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('modules.UQ_NAME')) {
          throw new BadRequestException('The module name already exists');
        }
      }
    }
  }

  async updateModule() {
    try {
      const exists = await this.repository.findOne({
        where: { id: this.entity.id },
      });
      if (!exists) {
        throw new BadRequestException('The module doesnot exist');
      }
      const positionId = this.entity?.position
        ? this.entity.position
        : exists.position;
      const position = await this.repository.findOne({
        where: { position: positionId },
      });
      if (!position) {
        throw new BadRequestException('The position doesnot exist');
      }
      if (this.entity.id === position.id) {
        return await this.repository.save(this.entity);
      }
      await this.repository.FindOneAndUpdate(
        { id: position.id },
        { position: exists.position },
      );

      const response = await this.repository.save(this.entity);
      return response;
    } catch (err) {
      if (err instanceof QueryFailedError) {
        if (err.message.includes('modules.UQ_NAME')) {
          throw new BadRequestException('The module name already exists');
        }
      }
      throw err;
    }
  }

  async deleteModule() {
    try {
      const response = await this.repository.softDataDelete({
        id: this.entity.id,
      });
      return response.affected === 1;
    } catch (error) {
      throw error;
    }
  }

  async viewModules() {
    try {
      const results = await this.repository.Paginate(this.pagination);
      return results;
    } catch (error) {
      throw error;
    }
  }
  async getSelectModules() {
    try {
      const data = await this.repository.find();
      if (data.length > 0) {
        return data.map((item) => {
          return { value: item.id, label: item.name };
        });
      }
      return [];
    } catch (err) {
      throw err;
    }
  }

  async findModuleWithDeleted() {
    try {
      const exists = await this.repository.findOne({
        where: { id: this.entity.id },
        withDeleted: true,
      });
      return exists;
    } catch (error) {
      throw error;
    }
  }
}
